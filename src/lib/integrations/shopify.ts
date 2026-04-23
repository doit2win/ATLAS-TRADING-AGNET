import dotenv from 'dotenv';
import { addLog } from '../utils/logger.js';

dotenv.config();

// ─────────────────────────────────────────────
// Shopify Admin REST API 2024-01
// Docs: https://shopify.dev/docs/api/admin-rest
// ─────────────────────────────────────────────

export interface ShopifyProduct {
  id?: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: 'active' | 'draft' | 'archived';
  variants: ShopifyVariant[];
  tags: string;
}

export interface ShopifyVariant {
  price: string;
  sku: string;
  inventory_quantity: number;
  inventory_management: string;
  requires_shipping: boolean;
  weight: number;
  weight_unit: string;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress;
  created_at: string;
}

export interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  product_id: number;
  variant_id: number;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  country_code: string;
}

export interface SyncResult {
  success: boolean;
  shopifyProductId?: number;
  shopifyHandle?: string;
  error?: string;
  simulated?: boolean;
}

// ─────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────
const getBaseUrl = () => {
  const store = process.env.SHOPIFY_STORE_URL?.replace(/https?:\/\//, '').replace(/\/$/, '');
  return `https://${store}/admin/api/2024-01`;
};

const getHeaders = () => ({
  'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export const isShopifyConfigured = () =>
  !!(process.env.SHOPIFY_STORE_URL && process.env.SHOPIFY_ACCESS_TOKEN);

// ─────────────────────────────────────────────
// Verify connection to the store
// ─────────────────────────────────────────────
export const testShopifyConnection = async (): Promise<{ connected: boolean; shop?: any; error?: string }> => {
  if (!isShopifyConfigured()) {
    return { connected: false, error: 'SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN not set in .env' };
  }
  try {
    const res = await fetch(`${getBaseUrl()}/shop.json`, { headers: getHeaders() });
    if (!res.ok) {
      const body = await res.text();
      return { connected: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = await res.json();
    addLog(`[Shopify] ✅ Connected to store: ${data.shop?.name} (${data.shop?.domain})`);
    return { connected: true, shop: data.shop };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
};

// ─────────────────────────────────────────────
// Push a single product to Shopify
// ─────────────────────────────────────────────
export const publishProductToShopify = async (product: {
  name: string;
  description: string;
  sale_price: number;
  cost_price: number;
  category: string;
  supplier: string;
  stock_count: number;
  id: number;
}): Promise<SyncResult> => {
  if (!isShopifyConfigured()) {
    // Simulation mode — return a fake Shopify ID so the UI still works
    const fakeId = Math.floor(Math.random() * 9000000000) + 1000000000;
    addLog(`[Shopify] ⚡ SIMULATED — Product "${product.name}" → Shopify ID ${fakeId}`);
    return { success: true, shopifyProductId: fakeId, shopifyHandle: product.name.toLowerCase().replace(/\s+/g, '-'), simulated: true };
  }

  const payload: { product: ShopifyProduct } = {
    product: {
      title: product.name,
      body_html: `<p>${product.description}</p><p><strong>Category:</strong> ${product.category}</p>`,
      vendor: product.supplier || 'ATLAS Store',
      product_type: product.category,
      status: 'active',
      tags: `${product.category}, dropship, atlas-sourced`,
      variants: [
        {
          price: product.sale_price.toFixed(2),
          sku: `ATLAS-${product.id}-${Date.now().toString(36).toUpperCase()}`,
          inventory_quantity: product.stock_count,
          inventory_management: 'shopify',
          requires_shipping: true,
          weight: 0.5,
          weight_unit: 'lb',
        }
      ],
    }
  };

  try {
    const res = await fetch(`${getBaseUrl()}/products.json`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      addLog(`[Shopify] ❌ Failed to publish "${product.name}": ${err.slice(0, 100)}`);
      return { success: false, error: err.slice(0, 200) };
    }
    const data = await res.json();
    const shopifyId = data.product.id;
    const handle = data.product.handle;
    addLog(`[Shopify] ✅ Published: "${product.name}" → ID ${shopifyId} | https://${process.env.SHOPIFY_STORE_URL}/products/${handle}`);
    return { success: true, shopifyProductId: shopifyId, shopifyHandle: handle };
  } catch (e: any) {
    addLog(`[Shopify] ❌ Network error publishing "${product.name}": ${e.message}`);
    return { success: false, error: e.message };
  }
};

// ─────────────────────────────────────────────
// Sync multiple products to Shopify in batch
// ─────────────────────────────────────────────
export const bulkSyncProductsToShopify = async (products: any[]): Promise<{
  synced: number; failed: number; results: (SyncResult & { name: string })[];
}> => {
  addLog(`[Shopify] 🔄 Syncing ${products.length} products to Shopify store...`);
  const results: (SyncResult & { name: string })[] = [];
  let synced = 0;
  let failed = 0;

  for (const prod of products) {
    const result = await publishProductToShopify(prod);
    results.push({ ...result, name: prod.name });
    if (result.success) synced++;
    else failed++;
    // Rate limit: Shopify allows 2 req/sec on Basic plan
    await new Promise(r => setTimeout(r, 600));
  }

  addLog(`[Shopify] ✅ Sync complete — ${synced} published, ${failed} failed`);
  return { synced, failed, results };
};

// ─────────────────────────────────────────────
// Pull orders from Shopify
// ─────────────────────────────────────────────
export const fetchShopifyOrders = async (status = 'any', limit = 50): Promise<{
  success: boolean; orders: ShopifyOrder[]; error?: string; simulated?: boolean;
}> => {
  if (!isShopifyConfigured()) {
    // Return simulated orders
    const simOrders: ShopifyOrder[] = Array.from({ length: 8 }, (_, i) => ({
      id: 5000000000 + i,
      order_number: 1001 + i,
      email: `customer${i}@example.com`,
      financial_status: 'paid',
      fulfillment_status: i % 3 === 0 ? 'fulfilled' : null,
      total_price: (29.99 + i * 10).toFixed(2),
      subtotal_price: (24.99 + i * 10).toFixed(2),
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      shipping_address: {
        first_name: 'John', last_name: `Doe${i}`,
        address1: `${100 + i} Main St`, city: 'San Francisco',
        province: 'California', zip: '94101',
        country: 'United States', country_code: 'US',
      },
      line_items: [{
        id: 1000 + i, title: ['Wireless Earbuds Pro X1', 'LED Ring Light', 'Smart Water Bottle', 'Sunset Lamp'][i % 4],
        quantity: 1, price: (29.99 + i * 10).toFixed(2),
        sku: `ATLAS-${i}-ABC`, product_id: 1000 + i, variant_id: 2000 + i,
      }],
    }));
    addLog(`[Shopify] ⚡ SIMULATED — Fetched ${simOrders.length} sample Shopify orders`);
    return { success: true, orders: simOrders, simulated: true };
  }

  try {
    const params = new URLSearchParams({ status, limit: String(limit), order: 'created_at DESC' });
    const res = await fetch(`${getBaseUrl()}/orders.json?${params}`, { headers: getHeaders() });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, orders: [], error: err.slice(0, 200) };
    }
    const data = await res.json();
    addLog(`[Shopify] 📦 Fetched ${data.orders.length} orders from Shopify`);
    return { success: true, orders: data.orders };
  } catch (e: any) {
    return { success: false, orders: [], error: e.message };
  }
};

// ─────────────────────────────────────────────
// Update order fulfillment on Shopify
// ─────────────────────────────────────────────
export const fulfillShopifyOrder = async (
  orderId: number,
  trackingNumber: string,
  trackingCompany: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isShopifyConfigured()) {
    addLog(`[Shopify] ⚡ SIMULATED — Fulfillment updated for order #${orderId} (${trackingNumber})`);
    return { success: true };
  }
  try {
    // Get fulfillment order ID first
    const foRes = await fetch(`${getBaseUrl()}/orders/${orderId}/fulfillment_orders.json`, { headers: getHeaders() });
    if (!foRes.ok) return { success: false, error: `Could not get fulfillment orders for ${orderId}` };
    const foData = await foRes.json();
    const fulfillmentOrderId = foData.fulfillment_orders?.[0]?.id;
    if (!fulfillmentOrderId) return { success: false, error: 'No fulfillment order found' };

    const res = await fetch(`${getBaseUrl()}/fulfillments.json`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        fulfillment: {
          line_items_by_fulfillment_order: [{ fulfillment_order_id: fulfillmentOrderId }],
          tracking_info: { number: trackingNumber, company: trackingCompany },
          notify_customer: true,
        }
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err.slice(0, 200) };
    }
    addLog(`[Shopify] ✅ Order #${orderId} fulfilled — Tracking: ${trackingNumber}`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

// ─────────────────────────────────────────────
// Register webhooks so Shopify pushes events to us
// ─────────────────────────────────────────────
export const registerShopifyWebhooks = async (callbackBaseUrl: string): Promise<{
  registered: string[]; errors: string[];
}> => {
  if (!isShopifyConfigured()) {
    addLog('[Shopify] ⚡ SIMULATED — Webhooks would be registered at ' + callbackBaseUrl);
    return { registered: ['orders/create', 'orders/fulfilled', 'products/update'], errors: [] };
  }

  const topics = ['orders/create', 'orders/paid', 'orders/fulfilled', 'products/update'];
  const registered: string[] = [];
  const errors: string[] = [];

  for (const topic of topics) {
    try {
      const res = await fetch(`${getBaseUrl()}/webhooks.json`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          webhook: {
            topic,
            address: `${callbackBaseUrl}/api/ecom/shopify/webhook`,
            format: 'json',
          }
        }),
      });
      if (res.ok) {
        registered.push(topic);
        addLog(`[Shopify] 🔔 Webhook registered: ${topic}`);
      } else {
        const err = await res.text();
        // "already registered" is fine
        if (err.includes('already')) registered.push(topic);
        else errors.push(`${topic}: ${err.slice(0, 80)}`);
      }
    } catch (e: any) {
      errors.push(`${topic}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return { registered, errors };
};
