import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Package, TrendingUp, Bot, Zap, RefreshCw,
  DollarSign, Target, ArrowUpRight, Activity, Truck
} from 'lucide-react';

const CHANNELS = [
  { name: 'Online Store',    share: 38, color: 'bg-emerald-500' },
  { name: 'Amazon',          share: 27, color: 'bg-amber-500'   },
  { name: 'TikTok Shop',     share: 18, color: 'bg-pink-500'    },
  { name: 'Instagram Shop',  share: 11, color: 'bg-purple-500'  },
  { name: 'eBay',            share: 6,  color: 'bg-blue-500'    },
];

const AGENT_MODELS = [
  { name: 'Scout',     model: 'Claude Sonnet 4.6', role: 'Product Sourcing',   color: 'text-orange-400',  dot: 'bg-orange-400' },
  { name: 'Validator', model: 'Gemini 2.0 Flash',  role: 'Market Validation',  color: 'text-blue-400',    dot: 'bg-blue-400'   },
  { name: 'Copy',      model: 'Llama-3.1-8B',      role: 'Content Generation', color: 'text-purple-400',  dot: 'bg-purple-400' },
  { name: 'Pricer',    model: 'Llama-3.1-8B',      role: 'Dynamic Pricing',    color: 'text-cyan-400',    dot: 'bg-cyan-400'   },
  { name: 'Nexus',     model: 'Logic Engine',       role: 'Fulfillment',        color: 'text-emerald-400', dot: 'bg-emerald-400'},
];

export default function ShopDashboard() {
  const [revenue, setRevenue] = useState<any>(null);
  const [swarmStatus, setSwarmStatus] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [swarmLogs, setSwarmLogs] = useState<string[]>([
    `[${new Date().toISOString()}] [System] DO IT 2 WIN — Biohacking & Longevity Commerce Engine initialized.`,
    `[${new Date().toISOString()}] [Scout-Claude] Scanning 6 biohacking niches: Longevity, Devices, Nootropics, Recovery, Alt-Med, Health Tech.`,
    `[${new Date().toISOString()}] [Validator-Gemini] Market validation layer online — targeting 70-80% margin products.`,
    `[${new Date().toISOString()}] [Copy-Llama] Brand voice loaded: scientific, empowering, results-driven.`,
    `[${new Date().toISOString()}] [Pricer-Llama] Premium pricing engine active — biohacker community pricing model.`,
    `[${new Date().toISOString()}] [Nexus] Fulfillment pipeline ready — 5 channels active. Target: $20K/month.`,
  ]);
  const [activeCategory, setActiveCategory] = useState('');
  const [swarmResult, setSwarmResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [revRes, statusRes, ordersRes] = await Promise.all([
        fetch('/api/ecom/revenue'),
        fetch('/api/ecom/swarm/status'),
        fetch('/api/ecom/orders?limit=8'),
      ]);
      const [revData, statusData, ordersData] = await Promise.all([
        revRes.json(), statusRes.json(), ordersRes.json()
      ]);
      if (revData.success) setRevenue(revData);
      if (statusData.success) setSwarmStatus(statusData);
      if (ordersData.success) setRecentOrders(ordersData.orders || []);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 8000);
    return () => clearInterval(iv);
  }, []);

  const runSwarm = async () => {
    setIsRunning(true);
    setSwarmResult(null);
    const ts = () => new Date().toISOString();
    setSwarmLogs(prev => [`[${ts()}] [System] 🚀 Launching 5-agent sourcing pipeline...`, ...prev]);
    try {
      const res = await fetch('/api/ecom/swarm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeCategory }),
      });
      const data = await res.json();
      if (data.success) {
        setSwarmResult(data.result);
        setSwarmLogs(prev => [
          `[${ts()}] [Scout-Claude] ✅ ${data.savedProducts?.length || 0} new products sourced`,
          `[${ts()}] [Nexus] Decision: ${data.result?.decision || 'OPTIMIZING'}`,
          `[${ts()}] [Pricer] Projected revenue: $${(data.result?.revenueProjection || 0).toFixed(0)}/mo`,
          ...prev
        ]);
        fetchData();
      }
    } catch (e: any) {
      setSwarmLogs(prev => [`[${ts()}] [System] ⚠️ Swarm error: ${e.message}`, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const generateOrders = async () => {
    try {
      const res = await fetch('/api/ecom/orders/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const ts = new Date().toISOString();
        setSwarmLogs(prev => [
          `[${ts}] [Nexus] 📦 ${data.ordersCreated} new orders generated across channels`,
          ...prev
        ]);
        fetchData();
      }
    } catch {}
  };

  const goalPct = revenue?.goalPct || 0;
  const goalColor = goalPct >= 100 ? 'text-emerald-400' : goalPct >= 60 ? 'text-amber-400' : 'text-rose-400';
  const barColor  = goalPct >= 100 ? 'bg-emerald-500' : goalPct >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/20 p-2.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">DO IT 2 WIN</span>
              <span className="text-[7px] text-amber-400/70 uppercase tracking-wider">Biohack · Perform · Evolve</span>
            </div>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded text-[10px] font-mono text-slate-300 px-2 py-1"
          >
            <option value="">All Niches</option>
            {['Longevity & Anti-Aging', 'Biohacking Devices', 'Nootropics & Brain Performance', 'Performance & Recovery', 'Alternative Medicine', 'Health Technology'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold text-slate-200 uppercase border border-slate-600 transition-all"
          >
            <Truck className="w-3 h-3" /> Simulate Orders
          </button>
          <button
            onClick={runSwarm}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] ${
              isRunning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-current" />}
            {isRunning ? 'Swarm Running...' : 'Source Products'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Monthly Revenue', value: `$${(revenue?.month || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`, sub: `Goal: $20,000`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-800/40' },
          { label: 'Monthly Profit',  value: `$${(revenue?.monthProfit || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`, sub: `${revenue?.month ? ((revenue.monthProfit/revenue.month)*100).toFixed(1) : 0}% margin`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-800/40' },
          { label: 'Total Orders', value: (revenue?.totalOrders || 0).toLocaleString(), sub: `${revenue?.today ? '$'+revenue.today.toFixed(2) : '$0'} today`, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-800/40' },
          { label: 'Goal Progress',  value: `${(revenue?.goalPct || 0).toFixed(1)}%`, sub: `$${(20000 - (revenue?.month||0)).toLocaleString('en-US', {maximumFractionDigits:0})} remaining`, icon: Target, color: goalColor, bg: 'bg-amber-500/5', border: 'border-amber-800/40' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} border ${kpi.border} rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden`}>
            <div className="absolute top-3 right-3 opacity-10">
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{kpi.label}</span>
            <span className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[9px] font-mono text-slate-500">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Goal Progress Bar */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">$20,000 / Month Revenue Goal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold ${goalColor}`}>{goalPct.toFixed(1)}%</span>
            <span className="text-[9px] font-mono text-slate-500">Projected: ${(revenue?.projected || 0).toLocaleString('en-US', {maximumFractionDigits:0})}/mo</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full ${barColor} transition-all duration-1000 shadow-lg relative`}
            style={{ width: `${Math.min(goalPct, 100)}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 animate-pulse" />
          </div>
          {[25, 50, 75].map(mark => (
            <div key={mark} className="absolute top-0 bottom-0 w-px bg-slate-700" style={{ left: `${mark}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[8px] font-mono text-slate-600">
          <span>$0</span><span>$5K</span><span>$10K</span><span>$15K</span><span>$20K</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Agent Swarm Panel */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Agent Status */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">AI Agent Swarm</h2>
              <span className="ml-auto text-[8px] font-mono text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">5 Models Active</span>
            </div>
            <div className="flex flex-col gap-2">
              {AGENT_MODELS.map((agent, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950/40 rounded p-2.5 border border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.dot} ${isRunning ? 'animate-pulse' : ''}`} />
                    <div>
                      <div className={`text-[10px] font-bold ${agent.color}`}>{agent.name}</div>
                      <div className="text-[8px] text-slate-500 font-mono">{agent.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-mono text-slate-400">{agent.model}</div>
                    <div className="text-[7px] font-mono text-emerald-500/70 mt-0.5">
                      {swarmStatus?.agents?.find((a: any) => a.name === agent.name)?.accuracy || '95.0%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Sales Channels</h2>
            </div>
            <div className="flex flex-col gap-2">
              {CHANNELS.map((ch, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-20 text-[9px] font-mono text-slate-400 truncate">{ch.name}</div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${ch.color} rounded-full transition-all duration-700`} style={{ width: `${ch.share}%` }} />
                  </div>
                  <div className="w-8 text-[9px] font-mono text-slate-400 text-right">{ch.share}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Swarm Result Card */}
          {swarmResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Last Swarm Result</span>
              </div>
              <div className="text-[9px] font-mono text-slate-300 space-y-1">
                <div>Decision: <span className="text-emerald-400 font-bold">{swarmResult.decision}</span></div>
                <div>Revenue Projection: <span className="text-cyan-400">${(swarmResult.revenueProjection || 0).toFixed(0)}/mo</span></div>
                <div>Category: <span className="text-purple-400">{swarmResult.targetCategory}</span></div>
                <div>Products found: <span className="text-amber-400">{swarmResult.fullProducts?.length || 0}</span></div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Products', to: '/shop/products', icon: Package,      color: 'text-emerald-400', border: 'border-emerald-800/40' },
              { label: 'Orders',   to: '/shop/orders',   icon: ShoppingCart, color: 'text-purple-400',  border: 'border-purple-800/40' },
              { label: 'Revenue',  to: '/shop/revenue',  icon: TrendingUp,   color: 'text-cyan-400',    border: 'border-cyan-800/40'   },
            ].map((link, i) => (
              <Link key={i} to={link.to} className={`flex flex-col items-center gap-1.5 p-3 bg-slate-900/40 border ${link.border} rounded-lg hover:bg-slate-800/60 transition-all group`}>
                <link.icon className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform`} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${link.color}`}>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Logs + Orders */}
        <div className="col-span-7 flex flex-col gap-4">
          {/* Agent Logs */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Agent Communication Log
              </h2>
              <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            </div>
            <div className="font-mono text-[9px] space-y-1.5 overflow-y-auto max-h-48 pr-1 custom-scrollbar text-slate-400">
              {swarmLogs.map((log, i) => {
                const agentMatch = log.match(/\[([A-Za-z\-]+)\]/g);
                const agent = agentMatch?.[1]?.replace(/[\[\]]/g, '') || '';
                const agentColors: Record<string, string> = {
                  'Scout-Claude': 'text-orange-400', 'Validator-Gemini': 'text-blue-400',
                  'Pricer-Llama': 'text-cyan-400',   'Copy-Llama': 'text-purple-400',
                  'Nexus': 'text-emerald-400',        'System': 'text-slate-300',
                };
                return (
                  <p key={i}>
                    <span className="text-slate-600">{log.match(/\[([\d\-T:.Z]+)\]/)?.[1]?.split('T')[1]?.slice(0,8) || ''} </span>
                    <span className={agentColors[agent] || 'text-slate-300'}>[{agent}] </span>
                    <span>{log.split('] ').slice(2).join('] ')}</span>
                  </p>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
                Recent Orders
              </h2>
              <Link to="/shop/orders" className="flex items-center gap-1 text-[8px] font-mono text-purple-400 hover:text-purple-300 transition-colors uppercase">
                View All <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[9px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/50">
                    <th className="pb-2 text-left font-medium uppercase">Order</th>
                    <th className="pb-2 text-left font-medium uppercase">Product</th>
                    <th className="pb-2 text-right font-medium uppercase">Total</th>
                    <th className="pb-2 text-right font-medium uppercase">Profit</th>
                    <th className="pb-2 text-right font-medium uppercase">Channel</th>
                    <th className="pb-2 text-right font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-center text-slate-600">No orders yet — click "Simulate Orders" to generate sample data</td></tr>
                  )}
                  {recentOrders.map((o, i) => (
                    <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 text-emerald-400/80">{o.order_number}</td>
                      <td className="py-2 text-slate-300 max-w-[120px] truncate">{o.product_name}</td>
                      <td className="py-2 text-right text-slate-200 font-bold">${parseFloat(o.total_amount).toFixed(2)}</td>
                      <td className="py-2 text-right text-emerald-400">+${parseFloat(o.profit || 0).toFixed(2)}</td>
                      <td className="py-2 text-right text-slate-400">{o.channel}</td>
                      <td className="py-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[7px] uppercase font-bold ${
                          o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                          o.status === 'shipped'   ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
