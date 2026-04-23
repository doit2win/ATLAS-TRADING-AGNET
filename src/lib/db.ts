import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: any;

export const getPool = () => {
  if (!pool) {
    const { Pool } = pg;
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
};

export const query = (text: string, params?: any[]) => getPool().query(text, params);

// Do It 2 Win — Biohacking, Longevity & Performance Niche
const SEED_PRODUCTS = [
  // ── Longevity & Anti-Aging
  { name: 'NMN 500mg Capsules (60ct)', category: 'Longevity & Anti-Aging', description: 'Pharmaceutical-grade NMN boosts NAD+ levels for cellular energy, DNA repair, and healthy aging. Third-party tested, vegan capsules. The #1 longevity supplement backed by David Sinclair research.', cost_price: 18.00, sale_price: 79.99, supplier: 'BioSource Labs', stock_count: 380, ai_score: 97.4 },
  { name: 'Trans-Resveratrol + Quercetin Stack (90ct)', category: 'Longevity & Anti-Aging', description: '98% pure trans-resveratrol 500mg + quercetin 250mg. Activates SIRT1 longevity pathways with powerful antioxidant synergy. Paired for maximum bioavailability — take with NMN for full protocol.', cost_price: 14.00, sale_price: 59.99, supplier: 'LongevityCore Supply', stock_count: 290, ai_score: 94.8 },
  { name: 'Spermidine Complex 10mg (60ct)', category: 'Longevity & Anti-Aging', description: 'Concentrated spermidine from wheat germ extract triggers autophagy — the body\'s cellular cleanup and renewal process. Clinically studied for brain health, heart function, and longevity extension.', cost_price: 22.00, sale_price: 94.99, supplier: 'BioSource Labs', stock_count: 175, ai_score: 96.1 },
  { name: 'Fisetin Senolytic 500mg (60ct)', category: 'Longevity & Anti-Aging', description: 'High-potency fisetin from strawberry extract — a senolytic that clears zombie senescent cells. Studied by Mayo Clinic. Supports healthy inflammatory response and cognitive clarity as you age.', cost_price: 16.00, sale_price: 69.99, supplier: 'LongevityCore Supply', stock_count: 220, ai_score: 95.3 },
  { name: 'Collagen Peptides Type I/III Powder (250g)', category: 'Longevity & Anti-Aging', description: 'Hydrolyzed bovine collagen peptides, unflavored. Supports skin elasticity, joint health, and connective tissue repair. Mixes instantly in any liquid. 25g protein per serving. Grass-fed, pasture-raised.', cost_price: 12.00, sale_price: 49.99, supplier: 'PurePerform Wholesale', stock_count: 450, ai_score: 91.2 },
  // ── Biohacking Devices
  { name: 'Red Light Therapy Panel 660nm/850nm', category: 'Biohacking Devices', description: '12" clinical-grade red + near-infrared light therapy panel. Stimulates mitochondrial ATP production, reduces inflammation, and accelerates recovery. 100 dual-chip LEDs, built-in timer.', cost_price: 55.00, sale_price: 199.99, supplier: 'BiohackTech Direct', stock_count: 120, ai_score: 98.2 },
  { name: 'Infrared Sauna Blanket Far-IR', category: 'Biohacking Devices', description: 'Far-infrared sauna blanket for full-body detox, stress relief, and metabolic boost. 3-zone heating up to 80°C, waterproof inner lining. Replicates traditional sauna benefits at home in 30 minutes.', cost_price: 65.00, sale_price: 249.99, supplier: 'BiohackTech Direct', stock_count: 95, ai_score: 96.7 },
  { name: 'PEMF Therapy Mat (Pulsed EM Field)', category: 'Biohacking Devices', description: 'Professional PEMF mat with 8 copper coils targeting cellular repair, bone density, sleep quality, and pain relief. 0.1–300Hz frequency range. Used by elite athletes and longevity clinics worldwide.', cost_price: 75.00, sale_price: 299.99, supplier: 'RecoveryTech Labs', stock_count: 80, ai_score: 97.9 },
  { name: 'Grounding Earthing Mat + Wristband Kit', category: 'Biohacking Devices', description: 'Conductive carbon-infused grounding mat connects you to Earth\'s electrons. Reduces EMF stress, promotes better sleep, and lowers cortisol. Includes wristband + 15ft grounding cord. Science-backed.', cost_price: 12.00, sale_price: 49.99, supplier: 'EarthConnect Supply', stock_count: 360, ai_score: 88.4 },
  { name: 'Red Light LED Face Mask Phototherapy', category: 'Biohacking Devices', description: 'Professional 660nm + 850nm LED face mask for skin rejuvenation, collagen stimulation, and acne reduction. 150 dual-chip LEDs, 20-min auto shutoff, adjustable strap. Clinically backed protocol included.', cost_price: 35.00, sale_price: 139.99, supplier: 'BiohackTech Direct', stock_count: 165, ai_score: 94.6 },
  // ── Nootropics & Brain Performance
  { name: "Lion's Mane + Cordyceps + Chaga Trio (90ct)", category: 'Nootropics & Brain Performance', description: 'Triple mushroom nootropic stack: Lion\'s Mane (NGF nerve growth factor), Cordyceps (VO2 max + ATP energy), Chaga (antioxidant immune shield). 10:1 dual-extract. No fillers, no mycelium.', cost_price: 16.00, sale_price: 64.99, supplier: 'MycoPerform Wholesale', stock_count: 310, ai_score: 96.5 },
  { name: 'Alpha-GPC 600mg + Bacopa Stack (60ct)', category: 'Nootropics & Brain Performance', description: 'Alpha-GPC raises acetylcholine for laser focus and memory consolidation. Bacopa Monnieri 50% bacosides enhances synaptic density. Clinically dosed for sustained cognitive performance under stress.', cost_price: 14.00, sale_price: 54.99, supplier: 'NeuroSource Labs', stock_count: 240, ai_score: 93.1 },
  { name: 'Methylene Blue 1% USP Grade (30ml)', category: 'Nootropics & Brain Performance', description: 'Pharmaceutical USP-grade methylene blue solution, 1mg/drop precision dosing. Mitochondrial electron carrier — boosts cellular respiration, cognitive function, and neuroprotection. Research-backed compound.', cost_price: 8.00, sale_price: 34.99, supplier: 'PrecisionBio Supply', stock_count: 285, ai_score: 92.8 },
  // ── Performance & Recovery
  { name: 'Peptide Support Complex BPC/TB Stack (60ct)', category: 'Performance & Recovery', description: 'Oral peptide support blend with BPC-157 fragment analogs and TB-500 mimetics. Supports gut lining healing, joint repair, and accelerated tissue recovery. Legal, non-prescription compliant formula.', cost_price: 24.00, sale_price: 99.99, supplier: 'PeptidePro Wholesale', stock_count: 140, ai_score: 98.6 },
  { name: 'TENS/EMS Muscle Recovery Device Pro', category: 'Performance & Recovery', description: '20-mode professional TENS + EMS device for pain relief, muscle activation, and faster recovery. 8 electrode pads, USB rechargeable, adjustable intensity. Physiotherapist-grade at home pricing.', cost_price: 22.00, sale_price: 89.99, supplier: 'RecoveryTech Labs', stock_count: 200, ai_score: 91.7 },
  { name: 'NAD+ Sublingual Drops 250mg/ml (30ml)', category: 'Performance & Recovery', description: 'Liposomal NAD+ sublingual drops — maximum absorption bypassing digestion entirely. 250mg per ml, 30-day supply. Boosts mitochondrial energy, cognitive clarity, and cellular repair. Fast-acting.', cost_price: 28.00, sale_price: 109.99, supplier: 'BioSource Labs', stock_count: 130, ai_score: 97.0 },
  { name: 'Berberine HCl 1200mg/day (90ct)', category: 'Performance & Recovery', description: 'High-potency berberine 400mg per capsule (3x daily = 1200mg). AMPK activator comparable to metformin in peer-reviewed studies. Supports blood sugar regulation, metabolic health, and gut microbiome.', cost_price: 9.00, sale_price: 39.99, supplier: 'MetabolicEdge Supply', stock_count: 420, ai_score: 93.9 },
  // ── Alternative Medicine & Adaptogens
  { name: 'Shilajit Resin Pure Grade A (50g)', category: 'Alternative Medicine', description: 'Himalayan shilajit resin with 85+ trace minerals, fulvic acid, and dibenzo-alpha-pyrones. Ayurvedic adaptogen for testosterone support, mitochondrial energy, and mineral bioavailability. Lab-certified purity.', cost_price: 15.00, sale_price: 64.99, supplier: 'AncientEarth Supply', stock_count: 195, ai_score: 95.7 },
  { name: 'KSM-66 Ashwagandha + Rhodiola Stack (90ct)', category: 'Alternative Medicine', description: 'KSM-66 ashwagandha 600mg (the gold-standard extract, 12-year clinical record) + Rhodiola Rosea 400mg per serving. Cortisol reduction, HPA axis support, improved stress resilience and athletic endurance.', cost_price: 13.00, sale_price: 54.99, supplier: 'AdaptogenCore Wholesale', stock_count: 330, ai_score: 94.2 },
  // ── Health Technology
  { name: 'Hydrogen Water Bottle Generator USB', category: 'Health Technology', description: 'SPE/PEM electrolysis produces 1200+ ppb hydrogen-rich water in 3 minutes. Molecular hydrogen is the smallest antioxidant known — crosses blood-brain barrier. BPA-free borosilicate glass, 400ml.', cost_price: 38.00, sale_price: 149.99, supplier: 'AquaHack Direct', stock_count: 150, ai_score: 93.4 },
  { name: 'HRV + SpO2 Smart Ring Gen 2', category: 'Health Technology', description: 'Titanium smart ring tracks HRV, SpO2, skin temp, sleep stages, and daily recovery score 24/7. 7-day battery, IP68 waterproof. No subscription required — full data ownership on your phone.', cost_price: 42.00, sale_price: 179.99, supplier: 'WearableBio Tech', stock_count: 110, ai_score: 96.8 },
  { name: 'Ozone Therapy Water Generator (Portable)', category: 'Health Technology', description: 'Cold plasma ozone generator for ozonated water applications. 600mg/h output, antibacterial and anti-inflammatory. Used for oral hygiene, wound care, skin protocols, and cellular detox programs.', cost_price: 35.00, sale_price: 139.99, supplier: 'BiohackTech Direct', stock_count: 90, ai_score: 90.5 },
  { name: 'CGM Glucose Monitor Starter Kit', category: 'Health Technology', description: 'Continuous glucose monitoring kit with 14-day sensor, app integration, and metabolic optimization protocol guide. See real-time blood sugar response to every meal, workout, and stressor. No finger pricks.', cost_price: 45.00, sale_price: 189.99, supplier: 'MetabolicEdge Supply', stock_count: 85, ai_score: 97.6 },
];

const SEED_ORDERS = () => {
  const orders = [];
  const channels = ['Online Store', 'Amazon', 'eBay', 'TikTok Shop', 'Instagram Shop'];
  const regions = ['US-CA', 'US-NY', 'US-TX', 'UK', 'CA', 'AU', 'DE', 'FR'];
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'processing'];
  const productNames = [
    'NMN 500mg Capsules (60ct)', 'Red Light Therapy Panel 660nm/850nm', 'Infrared Sauna Blanket Far-IR',
    "Lion's Mane + Cordyceps + Chaga Trio (90ct)", 'Peptide Support Complex BPC/TB Stack (60ct)',
    'NAD+ Sublingual Drops 250mg/ml (30ml)', 'Shilajit Resin Pure Grade A (50g)',
    'KSM-66 Ashwagandha + Rhodiola Stack (90ct)', 'Berberine HCl 1200mg/day (90ct)',
    'Collagen Peptides Type I/III Powder (250g)', 'Trans-Resveratrol + Quercetin Stack (90ct)',
    'HRV + SpO2 Smart Ring Gen 2', 'PEMF Therapy Mat (Pulsed EM Field)',
    'Fisetin Senolytic 500mg (60ct)', 'CGM Glucose Monitor Starter Kit'
  ];
  const prices = [79.99, 199.99, 249.99, 64.99, 99.99, 109.99, 64.99, 54.99, 39.99, 49.99, 59.99, 179.99, 299.99, 69.99, 189.99];
  const costs =  [18.00, 55.00,  65.00, 16.00, 24.00, 28.00,  15.00, 13.00, 9.00,  12.00, 14.00, 42.00,  75.00, 16.00,  45.00];

  const now = Date.now();
  for (let i = 0; i < 120; i++) {
    const prodIdx = Math.floor(Math.random() * productNames.length);
    const qty = Math.floor(Math.random() * 3) + 1;
    const price = prices[prodIdx];
    const cost = costs[prodIdx];
    const total = parseFloat((price * qty).toFixed(2));
    const profit = parseFloat(((price - cost) * qty).toFixed(2));
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now - daysAgo * 86400000);
    orders.push({
      order_number: `ATL-${String(10000 + i).padStart(5, '0')}`,
      product_name: productNames[prodIdx],
      quantity: qty,
      unit_price: price,
      total_amount: total,
      profit,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      customer_region: regions[Math.floor(Math.random() * regions.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      created_at: date.toISOString(),
    });
  }
  return orders;
};

export const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        pair VARCHAR(20) DEFAULT 'BTC/USD',
        side VARCHAR(10),
        amount VARCHAR(20),
        price DECIMAL(20, 2),
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        pnl VARCHAR(20),
        status VARCHAR(50) DEFAULT 'executed',
        reasoning TEXT,
        ip_address VARCHAR(45),
        audit_hash VARCHAR(64)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        cost_price DECIMAL(10,2),
        sale_price DECIMAL(10,2),
        margin_pct DECIMAL(5,2),
        supplier VARCHAR(100),
        stock_count INTEGER DEFAULT 100,
        status VARCHAR(20) DEFAULT 'active',
        ai_score DECIMAL(5,2),
        sourced_by VARCHAR(50) DEFAULT 'Scout-Claude',
        shopify_product_id BIGINT,
        shopify_handle VARCHAR(200),
        shopify_synced_at TIMESTAMPTZ,
        supplier_product_id VARCHAR(100),
        supplier_source VARCHAR(20) DEFAULT 'dsers',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE,
        product_id INTEGER,
        product_name VARCHAR(200),
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        customer_region VARCHAR(100) DEFAULT 'US',
        channel VARCHAR(50) DEFAULT 'Online Store',
        profit DECIMAL(10,2),
        fulfillment_agent VARCHAR(50) DEFAULT 'Nexus',
        shopify_order_id BIGINT,
        supplier_order_id VARCHAR(100),
        supplier VARCHAR(20) DEFAULT 'dsers',
        tracking_number VARCHAR(100),
        tracking_company VARCHAR(100),
        estimated_delivery VARCHAR(50),
        shipping_address JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new columns to existing tables if they don't exist (safe migration)
    const migrations = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_product_id BIGINT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_handle VARCHAR(200)`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_synced_at TIMESTAMPTZ`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_product_id VARCHAR(100)`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_source VARCHAR(20) DEFAULT 'dsers'`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS shopify_order_id BIGINT`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS supplier_order_id VARCHAR(100)`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS supplier VARCHAR(20) DEFAULT 'dsers'`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100)`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS tracking_company VARCHAR(100)`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS estimated_delivery VARCHAR(50)`,
      `ALTER TABLE orders   ADD COLUMN IF NOT EXISTS shipping_address JSONB`,
    ];
    for (const sql of migrations) {
      try { await query(sql); } catch {}
    }

    // Seed products if empty
    const { rows: prodRows } = await query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRows[0].count) === 0) {
      for (const p of SEED_PRODUCTS) {
        const margin = parseFloat((((p.sale_price - p.cost_price) / p.sale_price) * 100).toFixed(2));
        await query(
          `INSERT INTO products (name, category, description, cost_price, sale_price, margin_pct, supplier, stock_count, ai_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [p.name, p.category, p.description, p.cost_price, p.sale_price, margin, p.supplier, p.stock_count, p.ai_score]
        );
      }
      console.log(`--- Seeded ${SEED_PRODUCTS.length} products ---`);
    }

    // Seed orders if empty
    const { rows: ordRows } = await query('SELECT COUNT(*) FROM orders');
    if (parseInt(ordRows[0].count) === 0) {
      const seedOrders = SEED_ORDERS();
      for (const o of seedOrders) {
        try {
          await query(
            `INSERT INTO orders (order_number, product_name, quantity, unit_price, total_amount, profit, status, customer_region, channel, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [o.order_number, o.product_name, o.quantity, o.unit_price, o.total_amount, o.profit, o.status, o.customer_region, o.channel, o.created_at]
          );
        } catch {}
      }
      console.log(`--- Seeded ${seedOrders.length} orders ---`);
    }

    console.log("--- Neon DB Initialized Successfully ---");
  } catch (err: any) {
    console.error("--- Neon DB Initialization Failed ---", err.message);
  }
};
