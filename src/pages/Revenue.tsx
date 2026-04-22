import { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, ShoppingCart, Zap, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine
} from 'recharts';

const GOAL = 20000;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-2 text-[9px] font-mono">
      <div className="text-slate-400">{label}</div>
      <div className="text-emerald-400 font-bold">${payload[0]?.value?.toFixed(2)}</div>
    </div>
  );
};

export default function Revenue() {
  const [rev, setRev] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRevenue = async () => {
    try {
      const res = await fetch('/api/ecom/revenue');
      const data = await res.json();
      if (data.success) setRev(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRevenue();
    const iv = setInterval(fetchRevenue, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch('/api/ecom/orders/generate', { method: 'POST' });
      await fetchRevenue();
    } catch {}
    setGenerating(false);
  };

  const monthRev    = rev?.month || 0;
  const goalPct     = Math.min((monthRev / GOAL) * 100, 100);
  const projected   = rev?.projected || 0;
  const remaining   = Math.max(0, GOAL - monthRev);
  const dailyNeeded = remaining / Math.max(1, 30 - (new Date().getDate()));

  const barColor = goalPct >= 100 ? '#10B981' : goalPct >= 60 ? '#F59E0B' : '#EF4444';

  const milestones = [
    { pct: 25, label: '$5K',  reached: monthRev >= 5000  },
    { pct: 50, label: '$10K', reached: monthRev >= 10000 },
    { pct: 75, label: '$15K', reached: monthRev >= 15000 },
    { pct: 100,label: '$20K', reached: monthRev >= 20000 },
  ];

  const dailyChart = rev?.dailyChart || [];
  const weeklyChart = dailyChart.reduce((acc: any[], d: any, i: number) => {
    const weekIdx = Math.floor(i / 7);
    if (!acc[weekIdx]) acc[weekIdx] = { week: `W${weekIdx+1}`, revenue: 0 };
    acc[weekIdx].revenue += d.revenue;
    return acc;
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/20 p-2.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Revenue Tracker — $20K / Month Goal</span>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRevenue} className="p-1.5 bg-slate-800/50 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
              generating ? 'bg-slate-700 text-slate-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}
          >
            {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-current" />}
            {generating ? 'Generating...' : 'Add Revenue'}
          </button>
        </div>
      </div>

      {/* Big Goal Card */}
      <div className="bg-gradient-to-br from-slate-900/50 to-cyan-900/10 border border-cyan-800/30 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-6 -right-6 opacity-5">
          <Target className="w-32 h-32 text-cyan-400" />
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Monthly Revenue Progress</div>
            <div className="text-4xl font-bold font-mono text-white">
              ${monthRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">of ${GOAL.toLocaleString()} goal</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-slate-500 uppercase">Projected</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">${projected.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
            <div className="text-[9px] font-mono text-slate-500 mt-0.5">end of month</div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="relative mb-2">
          <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${goalPct}%`, background: `linear-gradient(90deg, ${barColor}aa, ${barColor})` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20 animate-pulse rounded-r-full" />
            </div>
          </div>
          {/* Milestone markers */}
          {milestones.map((m, i) => (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}>
              <div className={`w-0.5 h-5 ${m.reached ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="flex justify-between text-[8px] font-mono mb-4">
          <span className="text-slate-600">$0</span>
          {milestones.map((m, i) => (
            <span key={i} className={m.reached ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {m.reached ? '✓ ' : ''}{m.label}
            </span>
          ))}
        </div>

        {/* Sub-stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Remaining',     value: `$${remaining.toLocaleString('en-US', {maximumFractionDigits:0})}`, color: 'text-rose-400' },
            { label: 'Daily Needed',  value: `$${dailyNeeded.toFixed(0)}/day`,   color: 'text-amber-400' },
            { label: 'Total Orders',  value: rev?.totalOrders?.toLocaleString() || '0', color: 'text-purple-400' },
            { label: 'Month Profit',  value: `$${(rev?.monthProfit || 0).toLocaleString('en-US', {maximumFractionDigits:0})}`, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/40">
              <div className="text-[8px] text-slate-500 font-mono uppercase">{s.label}</div>
              <div className={`text-sm font-bold font-mono ${s.color} mt-0.5`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily Revenue Chart */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Daily Revenue (30 days)</h2>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-[9px] font-mono">Loading chart data...</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChart} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" fontSize={7} tick={{ fill: '#475569' }} tickLine={false} interval={4} />
                  <YAxis stroke="#475569" fontSize={7} tick={{ fill: '#475569' }} tickLine={false} tickFormatter={v => `$${v}`} width={45} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                  <ReferenceLine y={GOAL / 30} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Daily target', fill: '#F59E0B', fontSize: 8, position: 'insideTopRight' }} />
                  <Bar dataKey="revenue" fill="#10B981" radius={[2, 2, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weekly Chart */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Weekly Revenue Trend</h2>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyChart} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#475569" fontSize={7} tick={{ fill: '#475569' }} tickLine={false} />
                <YAxis stroke="#475569" fontSize={7} tick={{ fill: '#475569' }} tickLine={false} tickFormatter={v => `$${v.toFixed(0)}`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { period: 'Today',        value: rev?.today || 0,  icon: Zap,        color: 'text-amber-400',   target: GOAL / 30, targetLabel: 'daily target' },
          { period: 'This Week',    value: rev?.week || 0,   icon: ShoppingCart, color: 'text-purple-400', target: GOAL / 4.3, targetLabel: 'weekly target' },
          { period: 'This Month',   value: rev?.month || 0,  icon: Target,     color: 'text-emerald-400', target: GOAL,    targetLabel: 'monthly target' },
        ].map((card, i) => {
          const pct = Math.min((card.value / card.target) * 100, 100);
          const col = pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
          const textCol = pct >= 100 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400';
          return (
            <div key={i} className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase">{card.period}</span>
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${card.color} mb-1`}>
                ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[8px] font-mono text-slate-500 mb-3">
                vs ${card.target.toLocaleString('en-US', {maximumFractionDigits:0})} {card.targetLabel}
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${col} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <div className={`text-[8px] font-mono ${textCol} mt-1 text-right`}>{pct.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>

      {/* Projection Banner */}
      <div className={`rounded-lg p-4 border ${projected >= GOAL ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
        <div className="flex items-center gap-3">
          <Target className={`w-5 h-5 ${projected >= GOAL ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div>
            <div className={`text-[11px] font-bold uppercase tracking-wider ${projected >= GOAL ? 'text-emerald-400' : 'text-amber-400'}`}>
              {projected >= GOAL ? '🎯 ON TRACK — $20K Goal Within Reach!' : `📈 Projected: $${projected.toLocaleString('en-US', {maximumFractionDigits:0})}/month — Scaling needed`}
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              {projected >= GOAL
                ? `Current trajectory hits $${projected.toLocaleString('en-US', {maximumFractionDigits:0})} by month end. Keep running the sourcing swarm.`
                : `You need $${dailyNeeded.toFixed(0)}/day to hit $20K. Run the AI sourcing swarm to add more high-margin products.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
