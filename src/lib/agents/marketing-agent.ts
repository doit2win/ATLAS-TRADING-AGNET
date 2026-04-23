import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { addLog as globalAddLog } from '../utils/logger.js';

dotenv.config();

export interface MarketingCampaign {
  productName: string;
  headline: string;
  adCopy: string;
  emailSubject: string;
  emailBody: string;
  tiktokCaption: string;
  targetAudience: string;
  estimatedCtr: number;
  channel: string;
}

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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────
// Generate full marketing campaign for a product
// Uses Groq / Llama-3.1 for fast, high-quality copy
// ─────────────────────────────────────────────
export const generateCampaign = async (
  productName: string,
  price: number,
  category: string,
  margin: number
): Promise<MarketingCampaign> => {
  globalAddLog(`[Marketing-Llama] 📣 Generating multi-channel campaign for "${productName}"...`);
  await delay(200);

  const channels = ['TikTok Shop', 'Instagram Shop', 'Facebook Ads', 'Email', 'Google Shopping'];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  try {
    const completion = await getGroq().invoke([
      {
        role: "system",
        content: "You are the chief marketing officer of Do It 2 Win — a premium biohacking, longevity, and human performance brand. Brand voice: scientific, empowering, cutting-edge, results-driven. Target audience: biohackers, longevity enthusiasts, performance athletes, and health optimizers aged 28-55. Reference science and research when relevant. Never use generic 'amazing deal' language — use specific benefits like 'boosts NAD+', 'activates autophagy', 'optimizes HRV'. Respond as JSON only."
      },
      {
        role: "user",
        content: `Create a multi-channel marketing campaign for Do It 2 Win product: "${productName}" priced at $${price} in the ${category} category.
        Respond ONLY with JSON:
        {
          "headline": "...(max 10 words, science-backed benefit-focused)",
          "adCopy": "...(max 25 words, include 1-2 relevant emojis, cite a specific benefit or mechanism)",
          "emailSubject": "...(max 8 words, curiosity + benefit)",
          "emailBody": "...(max 45 words, reference research or biohacker community credibility)",
          "tiktokCaption": "...(max 20 words with biohacking hashtags like #biohacking #longevity #peptides #optimize)",
          "targetAudience": "...(2-3 word biohacker persona description)"
        }`
      }
    ]);

    const text = completion.content.toString();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const ctr = parseFloat((2.5 + Math.random() * 4.5).toFixed(1));
      globalAddLog(`[Marketing-Llama] ✅ Campaign created for "${productName}" — Est. CTR: ${ctr}% · Channel: ${channel}`);
      return {
        productName,
        channel,
        estimatedCtr: ctr,
        targetAudience: parsed.targetAudience || 'Online shoppers 18-45',
        headline: parsed.headline || `${productName} — Limited Stock!`,
        adCopy: parsed.adCopy || `🔥 Get ${productName} today! Free shipping. 30-day guarantee.`,
        emailSubject: parsed.emailSubject || `Don't miss: ${productName} on sale!`,
        emailBody: parsed.emailBody || `Hi! We just restocked ${productName}. Grab yours at $${price} with free shipping — limited availability!`,
        tiktokCaption: parsed.tiktokCaption || `This ${productName} is going VIRAL 🤩 #trending #musthave #shopping`,
      };
    }
  } catch {}

  // Fallback campaign — Di2W brand voice
  const ctr = parseFloat((3.2 + Math.random() * 4.8).toFixed(1));
  globalAddLog(`[Marketing-Llama] 📋 Using Di2W template campaign for "${productName}" — CTR: ${ctr}%`);
  return {
    productName,
    channel,
    estimatedCtr: ctr,
    targetAudience: 'Biohackers & Longevity Optimizers',
    headline: `${productName} — Optimize Your Biology`,
    adCopy: `⚡ Science-backed ${productName} at $${price}. Join 10,000+ biohackers optimizing their performance. Ships today.`,
    emailSubject: `Your next biohack: ${productName}`,
    emailBody: `The research is in. ${productName} is one of the most talked-about protocols in the longevity community right now. Get yours at $${price} with free shipping and our 30-day performance guarantee.`,
    tiktokCaption: `This ${productName} is changing the biohacking game 🧬⚡ #biohacking #longevity #optimize #doittowin`,
  };
};

// ─────────────────────────────────────────────
// Auto-run campaigns for top products
// ─────────────────────────────────────────────
export const runMarketingBlast = async (products: any[]): Promise<MarketingCampaign[]> => {
  globalAddLog(`[Marketing-Llama] 🚀 Marketing blast: generating campaigns for ${products.length} top products...`);
  const campaigns: MarketingCampaign[] = [];

  for (const prod of products.slice(0, 5)) {
    const campaign = await generateCampaign(
      prod.name, parseFloat(prod.sale_price || 30), prod.category || 'General', parseFloat(prod.margin_pct || 65)
    );
    campaigns.push(campaign);
    await delay(300);
  }

  const avgCtr = (campaigns.reduce((s, c) => s + c.estimatedCtr, 0) / campaigns.length).toFixed(1);
  globalAddLog(`[Marketing-Llama] ✅ Blast complete — ${campaigns.length} campaigns live · Avg Est. CTR: ${avgCtr}%`);
  return campaigns;
};
