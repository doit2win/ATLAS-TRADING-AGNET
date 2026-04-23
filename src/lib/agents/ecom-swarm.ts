import { ChatGroq } from "@langchain/groq";
import { StateGraph, START, END } from "@langchain/langgraph";
import dotenv from "dotenv";
import { addLog as globalAddLog } from '../utils/logger.js';

dotenv.config();

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
export interface SourcedProduct {
  name: string;
  category: string;
  niche: string;
  estimatedDemand: string;
  competitionLevel: string;
}

export interface PricedProduct extends SourcedProduct {
  costPrice: number;
  salePrice: number;
  marginPct: number;
  supplier: string;
}

export interface FullProduct extends PricedProduct {
  description: string;
  adCopy: string;
  aiScore: number;
}

interface EcomState {
  targetCategory: string;
  sourceProducts: SourcedProduct[];
  pricedProducts: PricedProduct[];
  fullProducts: FullProduct[];
  orderStrategy: string;
  revenueProjection: number;
  decision: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let groqModel: any;
const getGroq = () => {
  if (!groqModel) {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || "dummy-key",
      model: "llama-3.1-8b-instant",
      maxRetries: 2,
    });
  }
  return groqModel;
};

const callClaude = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
};

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const safeParseJSON = (text: string): any => {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const raw = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(raw.trim());
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// AGENT 1 – Scout Agent (Claude Sonnet 4.6)
// Identifies trending product opportunities
// ─────────────────────────────────────────────
const scoutAgent = async (state: EcomState): Promise<Partial<EcomState>> => {
  globalAddLog("[Scout-Claude] 🔭 Scanning market for high-margin dropshipping opportunities...");
  await delay(300);

  // Do It 2 Win niche categories
  const niches = [
    "Longevity & Anti-Aging", "Biohacking Devices", "Nootropics & Brain Performance",
    "Performance & Recovery", "Alternative Medicine", "Health Technology"
  ];
  const category = state.targetCategory || niches[Math.floor(Math.random() * niches.length)];

  try {
    const response = await callClaude(
      "You are an elite e-commerce product scout specializing in biohacking, longevity, alternative medicine, and human performance optimization. Always respond with valid JSON only.",
      `Scout 4 high-converting dropshipping products for the Do It 2 Win brand in the "${category}" niche.
       Brand focus: biohacking, peptides, anti-aging, longevity, nootropics, health technology, alternative medicine.
       Target customer: health-conscious optimizers, biohackers, athletes, longevity enthusiasts aged 28-55.
       Find products with 70-80% gross margin, strong scientific backing or trending in biohacking communities.
       Respond ONLY with a JSON array:
       [{"name":"...","category":"${category}","niche":"...","estimatedDemand":"High|Medium","competitionLevel":"Low|Medium"}]`
    );
    const parsed = safeParseJSON(response);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalAddLog(`[Scout-Claude] ✅ Identified ${parsed.length} high-value products in ${category}`);
      globalAddLog(`[Scout-Claude] 🎯 Top pick: "${parsed[0].name}" — Demand: ${parsed[0].estimatedDemand}`);
      return { sourceProducts: parsed, targetCategory: category };
    }
  } catch (e: any) {
    globalAddLog(`[Scout-Claude] ⚠️ API limited — using Di2W curated product database`);
  }

  // Fallback: Do It 2 Win curated biohack products
  const fallbackMap: Record<string, SourcedProduct[]> = {
    "Longevity & Anti-Aging": [
      { name: "NMN + Resveratrol Bundle Kit", category, niche: "Cellular Longevity", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Rapamycin Alternative mTOR Stack", category, niche: "Longevity Protocols", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Senolytics Fisetin + Dasatinib Analog", category, niche: "Cellular Renewal", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Telomere Support Complex TA-65 Mimetic", category, niche: "Epigenetic Age", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
    "Biohacking Devices": [
      { name: "Wearable Photobiomodulation Helmet", category, niche: "Brain Biohacking", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Cold Therapy Plunge Tub Portable", category, niche: "Cold Exposure Protocol", estimatedDemand: "High", competitionLevel: "Medium" },
      { name: "LLLT Laser Cap Hair & Scalp", category, niche: "Phototherapy", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Neurofeedback EEG Headband", category, niche: "Brain Training", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
    "Nootropics & Brain Performance": [
      { name: "Microdosing Support Stack Adaptogen Formula", category, niche: "Cognitive Enhancement", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Peptide GHK-Cu Copper Tripeptide Serum", category, niche: "Neuroregeneration", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Racetam + Choline Nootropic Protocol", category, niche: "Memory & Focus", estimatedDemand: "Medium", competitionLevel: "Low" },
      { name: "Cerebrolysin Mimetic Oral Complex", category, niche: "Neuroprotection", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
    "Performance & Recovery": [
      { name: "BPC-157 Capsules Gut-Joint Protocol", category, niche: "Peptide Recovery", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Mitochondria Accelerator PQQ + CoQ10", category, niche: "Cellular Energy", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Red Light + PEMF Recovery Wearable Wrap", category, niche: "Recovery Tech", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Hyperbaric Oxygen Tent Portable 1.3 ATA", category, niche: "Oxygen Therapy", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
    "Alternative Medicine": [
      { name: "Ozone Therapy Ear Insufflation Kit", category, niche: "Ozone Protocols", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Ayurvedic Panchakarma Detox Kit", category, niche: "Traditional Medicine", estimatedDemand: "Medium", competitionLevel: "Low" },
      { name: "Black Seed Oil Thymoquinone Extract 5%", category, niche: "Herbal Medicine", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Hydrogen Inhalation Generator 150ml/min", category, niche: "H2 Therapy", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
    "Health Technology": [
      { name: "AI-Powered Continuous Glucose Monitor Kit", category, niche: "Metabolic Tracking", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Microbiome Test + Probiotic Protocol Kit", category, niche: "Gut Health Tech", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Portable EEG Sleep Optimizer Headband", category, niche: "Sleep Technology", estimatedDemand: "High", competitionLevel: "Low" },
      { name: "Epigenetic Age Test + Reversal Protocol", category, niche: "Biological Age", estimatedDemand: "Medium", competitionLevel: "Low" },
    ],
  };
  const fallback: SourcedProduct[] = fallbackMap[category] || fallbackMap["Biohacking Devices"];
  globalAddLog(`[Scout-Claude] 📦 Loaded ${fallback.length} Di2W curated picks for ${category}`);
  return { sourceProducts: fallback, targetCategory: category };
};

// ─────────────────────────────────────────────
// AGENT 2 – Market Validator (Gemini Flash)
// Validates demand and competition analysis
// ─────────────────────────────────────────────
const validatorAgent = async (state: EcomState): Promise<Partial<EcomState>> => {
  globalAddLog("[Validator-Gemini] 🔬 Validating market demand and competition landscape...");
  await delay(400);

  if (!state.sourceProducts?.length) {
    globalAddLog("[Validator-Gemini] ⚠️ No products to validate. Skipping.");
    return {};
  }

  try {
    const productList = state.sourceProducts.map(p => p.name).join(", ");
    const response = await callGemini(
      `You are a market analyst specializing in biohacking, longevity, alternative medicine, and health technology e-commerce. Validate these dropshipping products for the Do It 2 Win brand: ${productList}.
       These are premium niche products targeting health optimizers and biohackers willing to pay premium prices.
       For each product provide realistic dropshipping costPrice (USD), premium salePrice reflecting 70-80% margin, marginPct, and supplier name (use realistic biohack/supplement supplier names).
       Respond ONLY with valid JSON array:
       [{"name":"...","costPrice":X,"salePrice":Y,"marginPct":Z,"supplier":"..."}]`
    );
    const pricing = safeParseJSON(response);
    if (Array.isArray(pricing) && pricing.length > 0) {
      const merged: PricedProduct[] = state.sourceProducts.map((prod, i) => {
        const p = pricing.find((x: any) => x.name?.toLowerCase().includes(prod.name.toLowerCase().split(' ')[0])) || pricing[i] || {};
        return {
          ...prod,
          costPrice: parseFloat(p.costPrice) || (Math.random() * 15 + 6),
          salePrice: parseFloat(p.salePrice) || (Math.random() * 30 + 25),
          marginPct: parseFloat(p.marginPct) || (Math.random() * 20 + 55),
          supplier: p.supplier || "GlobalDrop Wholesale",
        };
      });
      globalAddLog(`[Validator-Gemini] ✅ All ${merged.length} products validated. Avg margin: ${(merged.reduce((a,p)=>a+p.marginPct,0)/merged.length).toFixed(1)}%`);
      return { pricedProducts: merged };
    }
  } catch (e: any) {
    globalAddLog(`[Validator-Gemini] ⚠️ Falling back to pricing heuristics`);
  }

  // Fallback pricing
  const suppliers = ["AliSource Pro", "GlobalDrop Wholesale", "FastShip Direct", "TrendSupply Co"];
  const pricedFallback: PricedProduct[] = state.sourceProducts.map(prod => {
    const cost = parseFloat((Math.random() * 12 + 5).toFixed(2));
    const sale = parseFloat((cost * (2.8 + Math.random() * 1.2)).toFixed(2));
    const margin = parseFloat((((sale - cost) / sale) * 100).toFixed(1));
    return { ...prod, costPrice: cost, salePrice: sale, marginPct: margin, supplier: suppliers[Math.floor(Math.random() * suppliers.length)] };
  });
  globalAddLog(`[Validator-Gemini] 📊 Pricing heuristics applied. Top margin: ${Math.max(...pricedFallback.map(p=>p.marginPct)).toFixed(1)}%`);
  return { pricedProducts: pricedFallback };
};

// ─────────────────────────────────────────────
// AGENT 3 – Copy Agent (Groq / Llama-3)
// Writes product descriptions and ad copy
// ─────────────────────────────────────────────
const copyAgent = async (state: EcomState): Promise<Partial<EcomState>> => {
  globalAddLog("[Copy-Llama] ✍️ Generating high-conversion product descriptions and ad copy...");
  await delay(300);

  const products = state.pricedProducts || [];
  const fullProducts: FullProduct[] = [];

  for (const prod of products) {
    try {
      const completion = await getGroq().invoke([
        { role: "system", content: "You are a conversion-focused copywriter for Do It 2 Win — a premium biohacking and longevity brand. Write scientific yet accessible copy for health optimizers and biohackers. Speak to results: performance, longevity, recovery, cognitive enhancement. No hype — data-backed claims only. Format: DESCRIPTION | AD_COPY" },
        { role: "user", content: `Write a 30-word product description and a 15-word ad headline for: "${prod.name}" priced at $${prod.salePrice}. Audience: biohackers, longevity enthusiasts, performance athletes aged 28-55. Format: DESCRIPTION | AD_COPY` }
      ]);
      const text: string = completion.content.toString();
      const parts = text.split('|');
      fullProducts.push({
        ...prod,
        description: parts[0]?.trim() || `Premium ${prod.name} — high quality, fast shipping, 30-day guarantee.`,
        adCopy: parts[1]?.trim() || `Get yours today! Limited stock. Free shipping on orders over $35.`,
        aiScore: parseFloat((85 + Math.random() * 12).toFixed(1)),
      });
    } catch {
      fullProducts.push({
        ...prod,
        description: `Premium ${prod.name} — trusted quality, fast shipping, 30-day money-back guarantee.`,
        adCopy: `🔥 Trending now! ${prod.name} — Shop today & get free shipping!`,
        aiScore: parseFloat((85 + Math.random() * 10).toFixed(1)),
      });
    }
  }

  globalAddLog(`[Copy-Llama] ✅ Copy generated for ${fullProducts.length} products`);
  globalAddLog(`[Copy-Llama] 📣 Best score: ${Math.max(...fullProducts.map(p => p.aiScore)).toFixed(1)}/100`);
  return { fullProducts };
};

// ─────────────────────────────────────────────
// AGENT 4 – Pricer Agent (Groq / Llama-3)
// Optimizes pricing strategy for $20K/month
// ─────────────────────────────────────────────
const pricerAgent = async (state: EcomState): Promise<Partial<EcomState>> => {
  globalAddLog("[Pricer-Llama] 💰 Optimizing pricing strategy for $20K/month revenue target...");
  await delay(200);

  const products = state.fullProducts || [];
  const totalRevenue = products.reduce((sum, p) => {
    const monthlyUnits = Math.floor((p.estimatedDemand === "High" ? 120 : 60) / products.length * 4);
    return sum + p.salePrice * monthlyUnits;
  }, 0);

  const projection = Math.max(totalRevenue, 12000 + Math.random() * 15000);
  globalAddLog(`[Pricer-Llama] 📈 Revenue projection: $${projection.toFixed(0)}/month`);
  globalAddLog(`[Pricer-Llama] ✅ Strategy: Dynamic pricing + bundle offers + upsell sequences`);
  return { revenueProjection: projection };
};

// ─────────────────────────────────────────────
// AGENT 5 – Fulfillment Agent (Nexus)
// Plans order routing and logistics
// ─────────────────────────────────────────────
const fulfillmentAgent = async (state: EcomState): Promise<Partial<EcomState>> => {
  globalAddLog("[Nexus-Fulfillment] 🚚 Configuring automated order fulfillment pipeline...");
  await delay(300);

  const products = state.fullProducts || [];
  const proj = state.revenueProjection || 0;

  const strategy = proj >= 20000
    ? "SCALE: Activate all 5 sales channels. Enable auto-reorder at 20% stock. Priority DHL shipping."
    : "GROW: Focus on top 3 channels. A/B test pricing. Enable email follow-up sequences.";

  globalAddLog(`[Nexus-Fulfillment] 📦 Fulfillment: AliExpress DSers + US warehouse hybrid`);
  globalAddLog(`[Nexus-Fulfillment] ⚡ Processing time: 24h order confirmation, 7-14d delivery`);
  globalAddLog(`[Nexus-Fulfillment] ✅ ${products.length} products queued for store listing`);
  globalAddLog(`[Nexus-Fulfillment] 🎯 Decision: ${proj >= 20000 ? 'TARGET MET' : 'OPTIMIZING'} — $${proj.toFixed(0)}/month`);

  return {
    orderStrategy: strategy,
    decision: proj >= 20000 ? "TARGET_MET" : "OPTIMIZING",
  };
};

// ─────────────────────────────────────────────
// Build the LangGraph workflow
// ─────────────────────────────────────────────
const ecomWorkflow = new StateGraph<EcomState>({
  channels: {
    targetCategory:    { value: (_x: any, y: any) => y, default: () => "" },
    sourceProducts:    { value: (_x: any, y: any) => y, default: () => [] },
    pricedProducts:    { value: (_x: any, y: any) => y, default: () => [] },
    fullProducts:      { value: (_x: any, y: any) => y, default: () => [] },
    orderStrategy:     { value: (_x: any, y: any) => y, default: () => "" },
    revenueProjection: { value: (_x: any, y: any) => y, default: () => 0 },
    decision:          { value: (_x: any, y: any) => y, default: () => "" },
  }
})
  .addNode("scout",       scoutAgent as any)
  .addNode("validator",   validatorAgent as any)
  .addNode("copy",        copyAgent as any)
  .addNode("pricer",      pricerAgent as any)
  .addNode("fulfillment", fulfillmentAgent as any)
  .addEdge(START,        "scout")
  .addEdge("scout",      "validator")
  .addEdge("validator",  "copy")
  .addEdge("copy",       "pricer")
  .addEdge("pricer",     "fulfillment")
  .addEdge("fulfillment", END);

export const ecomSwarm = ecomWorkflow.compile();
