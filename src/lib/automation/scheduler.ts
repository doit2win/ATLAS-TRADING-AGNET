import { ecomSwarm } from '../agents/ecom-swarm.js';
import { runMarketingBlast } from '../agents/marketing-agent.js';
import { routeUnfulfilledOrders } from '../integrations/supplier.js';
import { bulkSyncProductsToShopify, fetchShopifyOrders } from '../integrations/shopify.js';
import { query } from '../db.js';
import { addLog as globalAddLog } from '../utils/logger.js';

export interface AutoJob {
  id: string;
  name: string;
  description: string;
  intervalMs: number;
  lastRun: number;
  nextRun: number;
  runCount: number;
  status: 'idle' | 'running' | 'success' | 'error';
  lastResult?: string;
  enabled: boolean;
}

const NICHES = [
  'Longevity & Anti-Aging', 'Biohacking Devices', 'Nootropics & Brain Performance',
  'Performance & Recovery', 'Alternative Medicine', 'Health Technology'
];
let nicheIndex = 0;

// Job registry
export const jobs: Record<string, AutoJob> = {
  scout: {
    id: 'scout',
    name: 'AI Product Scout',
    description: 'Runs 5-agent pipeline to source new high-margin products across all 6 niches',
    intervalMs: 6 * 60 * 60 * 1000, // 6 hours
    lastRun: 0,
    nextRun: Date.now() + 10 * 60 * 1000, // first run 10min after start
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
  routeOrders: {
    id: 'routeOrders',
    name: 'Order Router',
    description: 'Routes unfulfilled orders to optimal supplier (Spocket → DSers → CJ)',
    intervalMs: 30 * 60 * 1000, // 30 minutes
    lastRun: 0,
    nextRun: Date.now() + 2 * 60 * 1000, // 2 min
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Blast',
    description: 'Generates multi-channel ad campaigns for top 5 products across TikTok, Instagram, Email',
    intervalMs: 8 * 60 * 60 * 1000, // 8 hours
    lastRun: 0,
    nextRun: Date.now() + 15 * 60 * 1000, // 15 min
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
  shopifySync: {
    id: 'shopifySync',
    name: 'Shopify Product Sync',
    description: 'Publishes new products to Shopify storefront automatically',
    intervalMs: 12 * 60 * 60 * 1000, // 12 hours
    lastRun: 0,
    nextRun: Date.now() + 20 * 60 * 1000, // 20 min
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
  shopifyOrders: {
    id: 'shopifyOrders',
    name: 'Shopify Order Puller',
    description: 'Pulls new orders from Shopify storefront and ingests them into the pipeline',
    intervalMs: 15 * 60 * 1000, // 15 minutes
    lastRun: 0,
    nextRun: Date.now() + 5 * 60 * 1000, // 5 min
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
  restock: {
    id: 'restock',
    name: 'Low Stock Alert & Restock',
    description: 'Checks inventory levels and flags products below 50 units for reorder',
    intervalMs: 60 * 60 * 1000, // 1 hour
    lastRun: 0,
    nextRun: Date.now() + 8 * 60 * 1000,
    runCount: 0,
    status: 'idle',
    enabled: true,
  },
};

// Automation event log
export const automationLog: string[] = [];
const log = (msg: string) => {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  automationLog.unshift(entry);
  if (automationLog.length > 100) automationLog.pop();
  globalAddLog(msg);
};

// ─── Job Runners ──────────────────────────────────────────────────────────────

const runScout = async () => {
  const niche = NICHES[nicheIndex % NICHES.length];
  nicheIndex++;
  log(`[AutoPilot] Scout scanning niche: ${niche}`);
  const result: any = await ecomSwarm.invoke({
    targetCategory: niche,
    sourceProducts: [], pricedProducts: [], fullProducts: [],
    orderStrategy: '', revenueProjection: 0, decision: '',
  });
  let saved = 0;
  for (const prod of (result.fullProducts || [])) {
    try {
      const margin = (((prod.salePrice - prod.costPrice) / prod.salePrice) * 100).toFixed(2);
      await query(
        `INSERT INTO products (name, category, description, cost_price, sale_price, margin_pct, supplier, stock_count, ai_score, sourced_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Scout-Claude')`,
        [prod.name, prod.category, prod.description, prod.costPrice, prod.salePrice, margin, prod.supplier, 150, prod.aiScore]
      );
      saved++;
    } catch {}
  }
  return `${saved} products sourced from ${niche} — Decision: ${result.decision}`;
};

const runRouteOrders = async () => {
  const { rows: unfulfilled } = await query(
    `SELECT * FROM orders WHERE status = 'processing' AND supplier_order_id IS NULL LIMIT 20`
  );
  if (unfulfilled.length === 0) return 'No unfulfilled orders to route';
  const { routed, failed } = await routeUnfulfilledOrders(unfulfilled);
  return `Routed ${routed} orders, ${failed} failed`;
};

const runMarketing = async () => {
  const { rows: products } = await query(
    "SELECT * FROM products WHERE status = 'active' ORDER BY ai_score DESC LIMIT 5"
  );
  const campaigns = await runMarketingBlast(products);
  return `${campaigns.length} campaigns generated. Channels: TikTok, Instagram, Email, Facebook`;
};

const runShopifySync = async () => {
  const { rows: unsynced } = await query(
    "SELECT * FROM products WHERE shopify_product_id IS NULL AND status = 'active' LIMIT 20"
  );
  if (unsynced.length === 0) return 'All products already synced to Shopify';
  const { synced, failed } = await bulkSyncProductsToShopify(unsynced);
  return `Shopify: ${synced} synced, ${failed} failed`;
};

const runShopifyOrders = async () => {
  const result = await fetchShopifyOrders('unfulfilled', 50);
  if (!result.success) return 'Shopify order pull failed';
  const orders = result.orders || [];
  let inserted = 0;
  for (const o of orders) {
    try {
      await query(
        `INSERT INTO orders (order_number, product_name, quantity, unit_price, total_amount, status, shopify_order_id, channel)
         VALUES ($1,$2,$3,$4,$5,'processing',$6,'Online Store')
         ON CONFLICT (order_number) DO NOTHING`,
        [`SHPFY-${o.id}`, o.line_items?.[0]?.name || 'Shopify Product',
         o.line_items?.[0]?.quantity || 1, parseFloat(o.total_price || 0),
         parseFloat(o.total_price || 0), o.id]
      );
      inserted++;
    } catch {}
  }
  return `Shopify: pulled ${orders.length} orders, ${inserted} new`;
};

const runRestock = async () => {
  const { rows: lowStock } = await query(
    "SELECT name, stock_count FROM products WHERE stock_count < 50 AND status = 'active'"
  );
  if (lowStock.length === 0) return 'All products adequately stocked (≥50 units)';
  const names = lowStock.slice(0, 3).map((p: any) => p.name).join(', ');
  return `LOW STOCK ALERT: ${lowStock.length} products need reorder — ${names}${lowStock.length > 3 ? '...' : ''}`;
};

const JOB_FNS: Record<string, () => Promise<string>> = {
  scout: runScout,
  routeOrders: runRouteOrders,
  marketing: runMarketing,
  shopifySync: runShopifySync,
  shopifyOrders: runShopifyOrders,
  restock: runRestock,
};

export const runJob = async (jobId: string): Promise<{ success: boolean; result?: string; error?: string }> => {
  const job = jobs[jobId];
  if (!job) return { success: false, error: 'Unknown job' };
  if (job.status === 'running') return { success: false, error: 'Job already running' };

  job.status = 'running';
  log(`[AutoPilot] ▶ Starting job: ${job.name}`);
  try {
    const result = await JOB_FNS[jobId]();
    job.status = 'success';
    job.lastResult = result;
    job.lastRun = Date.now();
    job.nextRun = Date.now() + job.intervalMs;
    job.runCount++;
    log(`[AutoPilot] ✅ ${job.name}: ${result}`);
    return { success: true, result };
  } catch (e: any) {
    job.status = 'error';
    job.lastResult = e.message;
    job.lastRun = Date.now();
    job.nextRun = Date.now() + job.intervalMs;
    log(`[AutoPilot] ⚠️ ${job.name} failed: ${e.message}`);
    return { success: false, error: e.message };
  }
};

// ─── Scheduler tick (runs every 60s) ─────────────────────────────────────────
export const startScheduler = () => {
  log('[AutoPilot] ⚡ Do It 2 Win Automation Engine started — 6 jobs scheduled');
  setInterval(async () => {
    const now = Date.now();
    for (const job of Object.values(jobs)) {
      if (job.enabled && job.status !== 'running' && now >= job.nextRun) {
        runJob(job.id).catch(() => {});
      }
    }
  }, 60_000); // check every minute
};
