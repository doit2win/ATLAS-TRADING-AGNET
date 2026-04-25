import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Video, Instagram, Mail, Facebook, TrendingUp, Zap } from 'lucide-react';

interface Campaign {
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

const PLATFORM_CONFIG = [
  { key: 'tiktok',    label: 'TikTok',    icon: Video,       color: 'text-pink-400',    border: 'border-pink-500/25',    bg: 'bg-pink-500/8'   },
  { key: 'instagram', label: 'Instagram',  icon: Instagram,   color: 'text-purple-400',  border: 'border-purple-500/25',  bg: 'bg-purple-500/8' },
  { key: 'email',     label: 'Email',      icon: Mail,        color: 'text-cyan-400',    border: 'border-cyan-500/25',    bg: 'bg-cyan-500/8'   },
  { key: 'facebook',  label: 'Facebook',   icon: Facebook,    color: 'text-blue-400',    border: 'border-blue-500/25',    bg: 'bg-blue-500/8'   },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-slate-700/50 transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />}
    </button>
  );
}

export default function ContentStudio() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [generating, setGenerating] = useState(false);
  const [blasting, setBlasting] = useState(false);
  const [activePlatform, setActivePlatform] = useState('tiktok');

  useEffect(() => {
    fetch('/api/ecom/products')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProducts(d.products);
          if (d.products.length > 0) setSelectedProduct(d.products[0]);
        }
      })
      .catch(() => {});
  }, []);

  const generateSingle = async () => {
    if (!selectedProduct) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ecom/marketing/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct.name,
          price: selectedProduct.sale_price,
          category: selectedProduct.category,
          margin: selectedProduct.margin_pct,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(prev => [data.campaign, ...prev.filter(c => c.productName !== data.campaign.productName)]);
      }
    } catch {}
    setGenerating(false);
  };

  const blastAll = async () => {
    setBlasting(true);
    try {
      const res = await fetch('/api/ecom/marketing/blast', { method: 'POST' });
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch {}
    setBlasting(false);
  };

  const activeCampaign = selectedProduct
    ? campaigns.find(c => c.productName === selectedProduct.name)
    : campaigns[0];

  const getPlatformContent = (campaign: Campaign, platform: string) => {
    switch (platform) {
      case 'tiktok':    return { title: 'TikTok Caption', content: campaign.tiktokCaption, sub: `Hook your audience in 3 seconds · ${campaign.estimatedCtr}% est. CTR` };
      case 'instagram': return { title: 'Instagram Post', content: `${campaign.headline}\n\n${campaign.adCopy}\n\n${campaign.targetAudience} — tap link in bio.`, sub: `Visual-first · Story + Feed · ${campaign.targetAudience}` };
      case 'email':     return { title: 'Email Campaign', content: `Subject: ${campaign.emailSubject}\n\n${campaign.emailBody}`, sub: `List campaign · Open rate target ~28%` };
      case 'facebook':  return { title: 'Facebook Ad', content: `${campaign.headline}\n\n${campaign.adCopy}`, sub: `Cold audience · ${campaign.targetAudience} targeting` };
      default: return { title: '', content: '', sub: '' };
    }
  };

  return (
    <div className="p-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h1 className="text-[12px] font-black text-white uppercase tracking-widest">Content Studio</h1>
            <p className="text-[9px] font-mono text-slate-500 mt-0.5">AI-generated marketing for Do It 2 Win — TikTok · Instagram · Email · Facebook</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateSingle}
            disabled={generating || !selectedProduct}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${
              generating ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-purple-700 hover:bg-purple-600 border-purple-500/40 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]'
            }`}
          >
            {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generating ? 'Generating...' : 'Generate for Product'}
          </button>
          <button
            onClick={blastAll}
            disabled={blasting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${
              blasting ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-pink-700 hover:bg-pink-600 border-pink-500/40 text-white shadow-[0_0_12px_rgba(236,72,153,0.2)]'
            }`}
          >
            {blasting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {blasting ? 'Blasting...' : 'Generate All Top 5'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Product Selector */}
        <div className="col-span-3 flex flex-col gap-2">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Select Product</div>
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[600px] custom-scrollbar pr-1">
            {products.map((p, i) => {
              const hasCampaign = campaigns.some(c => c.productName === p.name);
              const isSelected = selectedProduct?.id === p.id;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-pink-500/10 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                      : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-[9px] font-bold leading-tight ${isSelected ? 'text-pink-300' : 'text-slate-300'}`}>
                      {p.name}
                    </span>
                    {hasCampaign && (
                      <span className="text-[6px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded uppercase font-mono shrink-0 mt-0.5">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] text-slate-500 font-mono">${parseFloat(p.sale_price).toFixed(2)}</span>
                    <span className="text-[7px] text-slate-600 font-mono truncate">{p.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campaign View */}
        <div className="col-span-9 flex flex-col gap-4">
          {!activeCampaign ? (
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl flex flex-col items-center justify-center py-20 gap-4">
              <Sparkles className="w-10 h-10 text-slate-700" />
              <div className="text-center">
                <p className="text-slate-500 text-sm font-medium">No campaign generated yet</p>
                <p className="text-slate-600 text-[11px] mt-1">Select a product and click "Generate for Product"</p>
              </div>
            </div>
          ) : (
            <>
              {/* Campaign Header */}
              <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[9px] font-mono text-pink-400/70 uppercase tracking-widest mb-1">Campaign for</div>
                    <h2 className="text-[13px] font-black text-white">{activeCampaign.productName}</h2>
                    <p className="text-[11px] text-slate-300 mt-1 font-medium">{activeCampaign.headline}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500">Est. CTR</div>
                    <div className="text-xl font-black text-pink-400">{activeCampaign.estimatedCtr}%</div>
                    <div className="text-[8px] font-mono text-slate-600 mt-0.5">{activeCampaign.targetAudience}</div>
                  </div>
                </div>
              </div>

              {/* Platform Tabs */}
              <div className="flex items-center gap-2">
                {PLATFORM_CONFIG.map(p => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setActivePlatform(p.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        activePlatform === p.key
                          ? `${p.bg} ${p.border} ${p.color}`
                          : 'bg-slate-900/30 border-slate-800/50 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Platform Content */}
              {(() => {
                const pConfig = PLATFORM_CONFIG.find(p => p.key === activePlatform)!;
                const { title, content, sub } = getPlatformContent(activeCampaign, activePlatform);
                return (
                  <div className={`${pConfig.bg} border ${pConfig.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${pConfig.color}`}>{title}</div>
                        <div className="text-[8px] font-mono text-slate-600 mt-0.5">{sub}</div>
                      </div>
                      <CopyButton text={content} />
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                      <pre className="text-[11px] text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
                    </div>
                  </div>
                );
              })()}

              {/* All Platforms Quick View */}
              <div className="grid grid-cols-2 gap-3">
                {PLATFORM_CONFIG.map(p => {
                  const Icon = p.icon;
                  const { title, content } = getPlatformContent(activeCampaign, p.key);
                  return (
                    <div key={p.key} className={`${p.bg} border ${p.border} rounded-lg p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3 h-3 ${p.color}`} />
                          <span className={`text-[9px] font-bold uppercase ${p.color}`}>{p.label}</span>
                        </div>
                        <CopyButton text={content} />
                      </div>
                      <p className="text-[8px] text-slate-400 line-clamp-2 font-mono">{content}</p>
                    </div>
                  );
                })}
              </div>

              {/* CTR Performance */}
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Campaign Performance Estimate</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Est. CTR', value: `${activeCampaign.estimatedCtr}%`, color: 'text-pink-400' },
                    { label: 'Target Audience', value: activeCampaign.targetAudience, color: 'text-purple-400' },
                    { label: 'Best Channel', value: activeCampaign.channel, color: 'text-cyan-400' },
                    { label: 'Niche Match', value: 'Biohackers', color: 'text-amber-400' },
                  ].map((m, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-sm font-black ${m.color}`}>{m.value}</div>
                      <div className="text-[7px] font-mono text-slate-600 uppercase tracking-wider mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* All Campaigns List */}
      {campaigns.length > 0 && (
        <div className="mt-4 bg-slate-900/30 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Generated Campaigns ({campaigns.length})</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {campaigns.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  const prod = products.find(p => p.name === c.productName);
                  if (prod) setSelectedProduct(prod);
                }}
                className="bg-slate-950/40 border border-slate-800/60 hover:border-pink-500/30 rounded-lg p-3 text-left transition-all group"
              >
                <div className="text-[9px] font-bold text-slate-300 group-hover:text-pink-300 transition-colors truncate">{c.productName}</div>
                <div className="text-[8px] text-slate-500 font-mono mt-1 truncate">{c.headline}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[7px] font-mono text-slate-600">{c.channel}</span>
                  <span className="text-[8px] font-bold text-pink-400">{c.estimatedCtr}% CTR</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
