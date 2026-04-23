import { Zap, Brain, Shield, TrendingUp, FlaskConical, Cpu, Heart, Star, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PILLARS = [
  {
    icon: FlaskConical,
    title: 'Longevity & Anti-Aging',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    desc: 'NMN, NAD+, senolytics, resveratrol, spermidine — the protocols that extend healthspan backed by the latest longevity research.',
    products: ['NMN 500mg', 'Trans-Resveratrol + Quercetin', 'Spermidine Complex', 'Fisetin Senolytic'],
  },
  {
    icon: Zap,
    title: 'Biohacking Devices',
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/5',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    desc: 'Red light therapy, PEMF mats, infrared saunas, grounding kits — hardware that upgrades your biology at the cellular level.',
    products: ['Red Light Panel 660/850nm', 'PEMF Therapy Mat', 'Infrared Sauna Blanket', 'LED Face Mask'],
  },
  {
    icon: Brain,
    title: 'Nootropics & Cognition',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    desc: "Lion's Mane, Alpha-GPC, Methylene Blue, Bacopa — compounds that sharpen focus, protect the brain, and accelerate neural growth.",
    products: ["Lion's Mane + Cordyceps + Chaga", 'Alpha-GPC + Bacopa Stack', 'Methylene Blue 1% USP'],
  },
  {
    icon: TrendingUp,
    title: 'Performance & Recovery',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    desc: 'Peptide support stacks, NAD+ drops, TENS/EMS devices, berberine — fuel output, slash recovery time, optimize metabolic health.',
    products: ['Peptide BPC/TB Stack', 'NAD+ Sublingual Drops', 'TENS/EMS Recovery Pro', 'Berberine HCl'],
  },
  {
    icon: Shield,
    title: 'Alternative Medicine',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    desc: 'Shilajit, ashwagandha KSM-66, rhodiola, ozone therapy — ancient wisdom validated by modern biochemistry.',
    products: ['Shilajit Resin Grade A', 'KSM-66 Ashwagandha + Rhodiola', 'Ozone Water Generator'],
  },
  {
    icon: Cpu,
    title: 'Health Technology',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    desc: 'CGM glucose monitors, HRV smart rings, hydrogen water generators — real-time biomarker data to guide your optimization protocols.',
    products: ['CGM Glucose Monitor Kit', 'HRV + SpO2 Smart Ring Gen 2', 'Hydrogen Water Bottle'],
  },
];

const STATS = [
  { label: 'Products Catalogued', value: '22+', color: 'text-amber-400' },
  { label: 'Avg Gross Margin', value: '76%', color: 'text-emerald-400' },
  { label: 'Monthly Target', value: '$20K', color: 'text-purple-400' },
  { label: 'AI Agents Running', value: '5', color: 'text-cyan-400' },
];

export default function Brand() {
  return (
    <div className="p-5 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-slate-900 via-[#0d0f18] to-slate-950 p-8 mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.06),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                <div>
                  <h1 className="text-3xl font-black text-white tracking-wider uppercase">DO IT 2 WIN</h1>
                  <p className="text-amber-400/80 text-[11px] font-mono uppercase tracking-[0.3em] mt-0.5">Optimize · Perform · Evolve</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed mt-4">
                The world's most advanced automated store for biohackers, longevity enthusiasts, and human performance
                optimizers. We source the top 1% of health technology, peptides, nootropics, and anti-aging protocols —
                curated by AI, validated by science, delivered worldwide.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <Link to="/shop/products"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Zap className="w-3.5 h-3.5" /> View Products
                </Link>
                <Link to="/shop"
                  className="flex items-center gap-2 px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold text-[11px] uppercase tracking-widest rounded-lg transition-all">
                  <TrendingUp className="w-3.5 h-3.5" /> Live Dashboard <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {STATS.map((s, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 text-center min-w-[100px]">
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-rose-400" />
          <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Our Mission</h2>
        </div>
        <p className="text-slate-400 text-[13px] leading-relaxed max-w-4xl">
          <span className="text-white font-semibold">Do It 2 Win</span> exists to democratize access to the tools and compounds
          that top biohackers, longevity researchers, and elite athletes use to operate at peak performance. We cut through
          the noise — no overpriced supplements, no pseudoscience — only products with genuine mechanisms of action, backed
          by peer-reviewed research or demonstrated protocols in the biohacking community. Every product in our catalog is
          AI-scored, margin-validated, and supplier-verified before it reaches our store.
        </p>
      </div>

      {/* 6 Pillars */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-400" />
          <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">6 Core Niches</h2>
          <span className="ml-auto text-[8px] font-mono text-slate-600 uppercase">All products AI-sourced & validated</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className={`${p.bg} border ${p.border} ${p.glow} rounded-xl p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${p.border} ${p.bg}`}>
                    <Icon className={`w-4 h-4 ${p.color}`} />
                  </div>
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider ${p.color}`}>{p.title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{p.desc}</p>
                <div className="border-t border-slate-800/60 pt-3 flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-1">Key Products</span>
                  {p.products.map((prod, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${p.color.replace('text-', 'bg-')}`} />
                      <span className="text-[9px] font-mono text-slate-400">{prod}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Customer */}
      <div className="mt-6 bg-gradient-to-r from-slate-900/60 to-slate-950/60 border border-slate-800/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Target Customer Profile</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Biohackers', desc: 'Self-experimenters tracking biomarkers, running protocols, and pushing biological limits', color: 'text-amber-400', border: 'border-amber-500/20' },
            { label: 'Longevity Enthusiasts', desc: 'Following Bryan Johnson, David Sinclair, and Peter Attia-style aging reversal protocols', color: 'text-emerald-400', border: 'border-emerald-500/20' },
            { label: 'Performance Athletes', desc: 'Elite and amateur athletes focused on recovery, VO2 max, HRV, and peak output', color: 'text-purple-400', border: 'border-purple-500/20' },
            { label: 'Health Optimizers', desc: 'Functional medicine patients and proactive health seekers aged 28–55 with disposable income', color: 'text-cyan-400', border: 'border-cyan-500/20' },
          ].map((c, i) => (
            <div key={i} className={`border ${c.border} rounded-lg p-3 bg-slate-950/40`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${c.color} mb-2`}>{c.label}</div>
              <p className="text-[9px] text-slate-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
