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

const SEED_PRODUCTS = [
  { name: 'Wireless Earbuds Pro X1', category: 'Electronics', description: 'Premium noise-cancelling wireless earbuds with 36h battery life and active noise cancellation. IPX5 waterproof.', cost_price: 12.50, sale_price: 49.99, supplier: 'TechDrop Wholesale', stock_count: 250, ai_score: 94.2 },
  { name: 'LED Ring Light Studio Kit', category: 'Electronics', description: '18-inch dimmable ring light with tripod stand, phone holder, and remote control. Perfect for content creators.', cost_price: 8.75, sale_price: 34.99, supplier: 'GadgetSource Pro', stock_count: 180, ai_score: 91.7 },
  { name: 'Smart Water Bottle HydroTrack', category: 'Health & Wellness', description: 'Temperature display, hydration reminders, 32oz BPA-free Tritan body. Syncs to fitness apps via Bluetooth.', cost_price: 9.25, sale_price: 39.99, supplier: 'WellnessWorld Supply', stock_count: 320, ai_score: 88.5 },
  { name: 'Portable Power Bank 20000mAh', category: 'Electronics', description: '20000mAh fast-charge power bank with USB-C PD 65W, dual USB-A ports. Charges laptop, phones, tablets.', cost_price: 14.50, sale_price: 59.99, supplier: 'TechDrop Wholesale', stock_count: 145, ai_score: 96.1 },
  { name: 'Premium Yoga Mat 6mm', category: 'Sports & Fitness', description: 'Eco-friendly TPE yoga mat with alignment lines, non-slip surface, and carrying strap. 183x61cm.', cost_price: 11.00, sale_price: 44.99, supplier: 'FitLife Wholesale', stock_count: 200, ai_score: 85.3 },
  { name: 'Phone Camera Lens Kit 9-in-1', category: 'Electronics', description: 'Universal clip-on lens set: 22x telephoto, wide angle, macro, fisheye, kaleidoscope. Fits all smartphones.', cost_price: 5.50, sale_price: 24.99, supplier: 'GadgetSource Pro', stock_count: 400, ai_score: 82.6 },
  { name: 'Jade Face Roller & Gua Sha Set', category: 'Beauty & Skincare', description: 'Authentic jade stone face roller with dual-head design and gua sha tool. Reduces puffiness and promotes circulation.', cost_price: 5.25, sale_price: 22.99, supplier: 'BeautyDrop Direct', stock_count: 350, ai_score: 89.4 },
  { name: 'Sunset Projection Lamp', category: 'Home & Decor', description: 'USB rotating sunset projector creates stunning rainbow atmosphere. 16 color modes, 360° rotation, perfect for bedroom.', cost_price: 9.75, sale_price: 39.99, supplier: 'HomeDecor Hub', stock_count: 275, ai_score: 93.8 },
  { name: 'Resistance Bands Set Pro', category: 'Sports & Fitness', description: '11-piece set: 5 loop bands, handles, door anchor, ankle straps, guide. 10-150lb resistance range.', cost_price: 6.75, sale_price: 27.99, supplier: 'FitLife Wholesale', stock_count: 420, ai_score: 87.2 },
  { name: 'Silk Sleep Eye Mask', category: 'Health & Wellness', description: '100% natural mulberry silk sleep mask with adjustable strap. Blocks 100% light, reduces dark circles.', cost_price: 4.50, sale_price: 19.99, supplier: 'WellnessWorld Supply', stock_count: 500, ai_score: 83.9 },
  { name: 'Wireless Charging Pad Trio', category: 'Electronics', description: '3-in-1 wireless charger for iPhone + AirPods + Apple Watch. 15W max output, LED indicator, anti-slip.', cost_price: 7.00, sale_price: 34.99, supplier: 'TechDrop Wholesale', stock_count: 190, ai_score: 90.5 },
  { name: 'Bamboo Desk Organizer Set', category: 'Home & Decor', description: 'Eco-friendly 5-piece bamboo organizer with pen holder, phone stand, paper tray, and drawer. Natural finish.', cost_price: 8.00, sale_price: 32.99, supplier: 'HomeDecor Hub', stock_count: 160, ai_score: 79.8 },
  { name: 'Mini 1080P Projector', category: 'Electronics', description: 'Compact HD projector, 5500 lumens, 300" display, WiFi, Bluetooth, keystone correction. Plug and play.', cost_price: 42.00, sale_price: 149.99, supplier: 'TechDrop Wholesale', stock_count: 75, ai_score: 97.3 },
  { name: 'Cat Automatic Water Fountain', category: 'Pets', description: '2.5L ultra-quiet pet water fountain with triple filtration, LED indicator, auto-shutoff. BPA-free materials.', cost_price: 8.50, sale_price: 34.99, supplier: 'PetLife Supply Co', stock_count: 230, ai_score: 86.7 },
  { name: 'Ergonomic Mouse Pad XL', category: 'Electronics', description: '900x400mm extended mouse pad with non-slip rubber base, water-resistant surface. Includes wrist rest.', cost_price: 6.50, sale_price: 29.99, supplier: 'GadgetSource Pro', stock_count: 310, ai_score: 81.4 },
  { name: 'Collagen Glow Serum 50ml', category: 'Beauty & Skincare', description: 'Marine collagen + hyaluronic acid face serum. Reduces fine lines 30% in 4 weeks. Dermatologist tested.', cost_price: 7.25, sale_price: 32.99, supplier: 'BeautyDrop Direct', stock_count: 280, ai_score: 92.1 },
  { name: 'Posture Corrector Back Brace', category: 'Health & Wellness', description: 'Adjustable posture corrector with breathable mesh. Relieves back pain, improves posture in 4 weeks.', cost_price: 8.00, sale_price: 35.99, supplier: 'WellnessWorld Supply', stock_count: 195, ai_score: 88.0 },
  { name: 'TikTok LED Strip Lights 10m', category: 'Home & Decor', description: '10m RGB LED strip with app control, music sync, 16 million colors. USB powered, adhesive backing.', cost_price: 7.50, sale_price: 29.99, supplier: 'HomeDecor Hub', stock_count: 450, ai_score: 95.6 },
];

const SEED_ORDERS = () => {
  const orders = [];
  const channels = ['Online Store', 'Amazon', 'eBay', 'TikTok Shop', 'Instagram Shop'];
  const regions = ['US-CA', 'US-NY', 'US-TX', 'UK', 'CA', 'AU', 'DE', 'FR'];
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'processing'];
  const productNames = [
    'Wireless Earbuds Pro X1', 'LED Ring Light Studio Kit', 'Portable Power Bank 20000mAh',
    'Sunset Projection Lamp', 'Smart Water Bottle HydroTrack', 'TikTok LED Strip Lights 10m',
    'Jade Face Roller & Gua Sha Set', 'Mini 1080P Projector', 'Resistance Bands Set Pro',
    'Silk Sleep Eye Mask', 'Wireless Charging Pad Trio', 'Collagen Glow Serum 50ml'
  ];
  const prices = [49.99, 34.99, 59.99, 39.99, 39.99, 29.99, 22.99, 149.99, 27.99, 19.99, 34.99, 32.99];
  const costs =  [12.50, 8.75, 14.50, 9.75, 9.25, 7.50, 5.25, 42.00, 6.75, 4.50, 7.00, 7.25];

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
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
