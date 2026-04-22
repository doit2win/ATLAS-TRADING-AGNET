import { AlertCircle, TrendingUp, TrendingDown, Zap, ShoppingCart, Package, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

const STATIC_ITEMS = [
  { type: 'alert',  text: '[ATLAS] Initiating cross-chain arbitrage scan on ETH/USDC pairs.' },
  { type: 'up',     text: 'BTC/USD +2.4% | Volume spiking on Binance.' },
  { type: 'down',   text: 'SOL/USD -1.2% | Network congestion detected.' },
  { type: 'info',   text: '[NOVA] Sentiment analysis on Crypto Twitter indicates 78% Bullish bias.' },
  { type: 'order',  text: '[Nexus] Order ATL-00142 fulfilled via DHL — Wireless Earbuds Pro X1 · $49.99 · US-CA' },
  { type: 'sale',   text: '[Scout-Claude] New product sourced: Hydrogel Under-Eye Patches — 71.4% margin · TikTok trending' },
  { type: 'rev',    text: '[Pricer] Revenue projection updated: $18,420/month · Goal: $20K · 92.1% progress' },
  { type: 'order',  text: '[Nexus] Order ATL-00187 confirmed — Mini 1080P Projector · $149.99 · Amazon · UK' },
  { type: 'alert',  text: '[ORION] ERC-8004 signed transaction 0x4f3e...b1d confirmed on Base Sepolia.' },
  { type: 'sale',   text: '[Validator-Gemini] Market validation: LED Strip Lights 10m — HIGH demand, LOW competition' },
  { type: 'up',     text: 'ETH Gas Fees stable at 12 Gwei.' },
  { type: 'order',  text: '[Nexus] Batch fulfilled: 12 orders shipped via AliExpress DSers — avg delivery 9 days' },
  { type: 'rev',    text: '[Pricer-Llama] Dynamic price update: Smart Water Bottle → $42.99 (+7.5%) based on demand spike' },
  { type: 'info',   text: '[Copy-Llama] Ad copy generated: "🔥 Trending Now — Get yours before stock runs out!" · CTR: 4.2%' },
  { type: 'sale',   text: '[Scout-Claude] Niche identified: Sunset Lamp Projectors trending +340% on TikTok Shop' },
];

export default function Ticker() {
  const [liveItems, setLiveItems] = useState(STATIC_ITEMS);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch('/api/ecom/revenue');
        const data = await res.json();
        if (data.success) {
          setLiveItems([
            { type: 'rev', text: `[Revenue] Month: $${data.month?.toFixed(2)} · Goal: $20K · ${data.goalPct?.toFixed(1)}% · Projected: $${data.projected?.toFixed(0)}` },
            { type: 'order', text: `[Orders] ${data.totalOrders} total orders this month · Today: $${data.today?.toFixed(2)}` },
            ...STATIC_ITEMS,
          ]);
        }
      } catch {}
    };
    fetchRevenue();
    const iv = setInterval(fetchRevenue, 30000);
    return () => clearInterval(iv);
  }, []);

  const getIcon = (type: string) => {
    if (type === 'up')    return <TrendingUp className="w-3 h-3 text-emerald-400 mr-2 shrink-0" />;
    if (type === 'down')  return <TrendingDown className="w-3 h-3 text-rose-400 mr-2 shrink-0" />;
    if (type === 'order') return <ShoppingCart className="w-3 h-3 text-purple-400 mr-2 shrink-0" />;
    if (type === 'sale')  return <Package className="w-3 h-3 text-orange-400 mr-2 shrink-0" />;
    if (type === 'rev')   return <DollarSign className="w-3 h-3 text-cyan-400 mr-2 shrink-0" />;
    if (type === 'alert') return <AlertCircle className="w-3 h-3 text-amber-400 mr-2 shrink-0" />;
    return <Zap className="w-3 h-3 text-cyan-400 mr-2 shrink-0" />;
  };

  const getColor = (type: string) => {
    if (type === 'up')    return 'text-emerald-400/90';
    if (type === 'down')  return 'text-rose-400/90';
    if (type === 'order') return 'text-purple-400/90';
    if (type === 'sale')  return 'text-orange-400/90';
    if (type === 'rev')   return 'text-cyan-400/90';
    if (type === 'alert') return 'text-amber-400/90';
    return 'text-slate-400/90';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-slate-950 border-t border-slate-800 flex items-center overflow-hidden z-50">
      <div className="flex items-center px-4 bg-purple-900/40 border-r border-purple-500/30 h-full z-10 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.5)]">
        <span className="text-purple-400 font-mono text-xs font-bold whitespace-nowrap flex items-center gap-2">
          <Zap className="w-3 h-3" /> LIVE FEED
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full">
        <div className="absolute whitespace-nowrap flex items-center h-full animate-ticker">
          {[...liveItems, ...liveItems].map((item, i) => (
            <div key={i} className="flex items-center mx-8 font-mono text-xs">
              {getIcon(item.type)}
              <span className={getColor(item.type)}>{item.text}</span>
              <span className="mx-8 text-slate-700">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
