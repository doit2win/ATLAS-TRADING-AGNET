import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Zap, RefreshCw, Shield, ShoppingCart, Star } from 'lucide-react';

interface AgentConfig {
  name: string;
  model: string;
  role: string;
  color: string;
  bgColor: string;
  dotColor: string;
  tag: string;
}

const AGENTS: AgentConfig[] = [
  { name: 'Scout',     model: 'Claude Sonnet 4.6', role: 'Product Sourcing',   color: 'text-orange-400', bgColor: 'bg-orange-500/10', dotColor: 'bg-orange-400', tag: 'ANTHROPIC'  },
  { name: 'Validator', model: 'Gemini 2.0 Flash',  role: 'Market Validation',  color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   dotColor: 'bg-blue-400',   tag: 'GOOGLE'     },
  { name: 'Copy',      model: 'Llama-3.1-8B',      role: 'Content & Ad Copy',  color: 'text-purple-400', bgColor: 'bg-purple-500/10', dotColor: 'bg-purple-400', tag: 'GROQ'       },
  { name: 'Pricer',    model: 'Llama-3.1-8B',      role: 'Dynamic Pricing',    color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10',   dotColor: 'bg-cyan-400',   tag: 'GROQ'       },
  { name: 'Nexus',     model: 'Logic Engine v2',   role: 'Order Fulfillment',  color: 'text-emerald-400',bgColor: 'bg-emerald-500/10',dotColor: 'bg-emerald-400',tag: 'INTERNAL'   },
];

const INIT_LOGS = [
  `[${new Date().toISOString()}] [System] ATLAS E-Commerce Swarm Matrix initialized.`,
  `[${new Date().toISOString()}] [Scout] Claude Sonnet 4.6 — scanning product niches across 6 categories.`,
  `[${new Date().toISOString()}] [Validator] Gemini 2.0 Flash — market validation layer ready.`,
  `[${new Date().toISOString()}] [Copy] Llama-3.1-8B — conversion copywriter standing by.`,
  `[${new Date().toISOString()}] [Pricer] Llama-3.1-8B — pricing optimizer ready. Target: $20K/month.`,
  `[${new Date().toISOString()}] [Nexus] Logic Engine — 5 channels connected. Fulfillment pipeline active.`,
];

export default function EcomMatrix() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>(INIT_LOGS);
  const [isRunning, setIsRunning] = useState(false);
  const [swarmStatus, setSwarmStatus] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);
  const [activeAgentIdx, setActiveAgentIdx] = useState<number | null>(null);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    fetch('/api/ecom/swarm/status').then(r => r.json()).then(d => { if (d.success) setSwarmStatus(d); }).catch(() => {});
    const iv = setInterval(() => {
      fetch('/api/ecom/swarm/status').then(r => r.json()).then(d => { if (d.success) setSwarmStatus(d); }).catch(() => {});
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // Animate agents sequentially during run
  const animateAgents = async () => {
    for (let i = 0; i < AGENTS.length; i++) {
      setActiveAgentIdx(i);
      await new Promise(r => setTimeout(r, 1800));
    }
    setActiveAgentIdx(null);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${msg}`]);
  };

  const handleRunSwarm = async () => {
    setIsRunning(true);
    setLastResult(null);
    setSavedProducts([]);

    addLog('[System] 🚀 Launching full e-commerce agent pipeline...');
    addLog(`[Scout] 🔭 Scanning market for "${activeCategory || 'trending'}" products...`);

    animateAgents();

    try {
      const res = await fetch('/api/ecom/swarm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeCategory }),
      });
      const data = await res.json();

      if (data.success) {
        const r = data.result;
        setLastResult(r);
        setSavedProducts(data.savedProducts || []);
        addLog(`[Scout] ✅ Found ${r.sourceProducts?.length || 0} opportunities in ${r.targetCategory}`);
        addLog(`[Validator] 📊 Market validated — avg margin: ${r.pricedProducts?.length ? (r.pricedProducts.reduce((s: number, p: any) => s + p.marginPct, 0) / r.pricedProducts.length).toFixed(1) : '?'}%`);
        addLog(`[Copy] ✍️ Product descriptions generated for ${r.fullProducts?.length || 0} items`);
        addLog(`[Pricer] 💰 Revenue projection: $${(r.revenueProjection || 0).toFixed(0)}/month`);
        addLog(`[Nexus] 📦 ${data.savedProducts?.length || 0} products queued for all 5 channels`);
        addLog(`[System] 🎯 Decision: ${r.decision || 'OPTIMIZING'} — swarm cycle complete`);
      }
    } catch (e: any) {
      addLog(`[System] ⚠️ Swarm error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 p-5 flex flex-col bg-[#0B0E14] text-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/shop')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              E-Commerce Agent Matrix
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">5-MODEL AI SOURCING PIPELINE · TARGETING $20K/MONTH</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300 px-2 py-1.5">
            <option value="">All Categories</option>
            {['Electronics', 'Beauty & Skincare', 'Home & Decor', 'Health & Wellness', 'Sports & Fitness', 'Pets'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={handleRunSwarm} disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all ${
              isRunning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
            }`}>
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pipeline Running...' : 'Run Sourcing Pipeline'}
          </button>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[9px] font-mono text-purple-400 uppercase">5 Models Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left: Agent Pipeline Visualization */}
        <div className="col-span-4 flex flex-col gap-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Agent Pipeline
            </h3>
            <div className="flex flex-col gap-2 relative">
              {/* Vertical connector */}
              <div className="absolute left-5 top-8 bottom-8 w-px bg-slate-800 z-0" />

              {AGENTS.map((agent, i) => {
                const isActive = activeAgentIdx === i && isRunning;
                const isDone = activeAgentIdx !== null && i < activeAgentIdx && isRunning;
                return (
                  <div key={i} className="relative z-10">
                    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                      isActive ? `${agent.bgColor} border-current opacity-100 shadow-lg` :
                      isDone ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' :
                      'bg-slate-950/40 border-slate-800/40 opacity-60'
                    }`} style={isActive ? { borderColor: 'currentColor' } : {}}>
                      <div className={`w-10 h-10 rounded-lg ${agent.bgColor} border border-slate-700 flex items-center justify-center shrink-0 relative`}>
                        <Bot className={`w-5 h-5 ${agent.color}`} />
                        {isActive && <div className="absolute inset-0 rounded-lg animate-ping opacity-20" style={{ background: 'currentColor' }} />}
                        {isDone && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-[6px] text-white font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-bold ${agent.color}`}>{agent.name}</div>
                        <div className="text-[8px] text-slate-500 font-mono truncate">{agent.role}</div>
                        <div className="text-[7px] font-mono text-slate-600 mt-0.5">{agent.model}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[7px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                          agent.tag === 'ANTHROPIC' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                          agent.tag === 'GOOGLE'    ? 'text-blue-400   border-blue-500/30   bg-blue-500/10'   :
                          agent.tag === 'GROQ'      ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                                                     'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}>{agent.tag}</span>
                        <div className="mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ml-auto ${isActive ? `${agent.dotColor} animate-ping` : isDone ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        </div>
                      </div>
                    </div>
                    {i < AGENTS.length - 1 && (
                      <div className={`ml-5 h-2 w-px ${isDone ? 'bg-emerald-500' : 'bg-slate-700'} transition-colors duration-500`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-purple-400 uppercase">Last Pipeline Result</span>
              </div>
              <div className="space-y-1.5 text-[9px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Decision</span>
                  <span className={`font-bold ${lastResult.decision === 'TARGET_MET' ? 'text-emerald-400' : 'text-amber-400'}`}>{lastResult.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue Projection</span>
                  <span className="text-cyan-400">${(lastResult.revenueProjection || 0).toFixed(0)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-300">{lastResult.targetCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Products Added</span>
                  <span className="text-emerald-400">{savedProducts.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sourced Products preview */}
          {savedProducts.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">Newly Sourced</span>
              </div>
              <div className="space-y-2">
                {savedProducts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 bg-slate-950/50 rounded p-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-slate-200 font-bold truncate">{p.name}</div>
                      <div className="text-[7px] text-slate-500 font-mono">{p.category}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-bold text-emerald-400">${parseFloat(p.sale_price || 0).toFixed(2)}</div>
                      <div className="text-[7px] text-slate-500">{parseFloat(p.margin_pct || 0).toFixed(1)}% margin</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Consensus Log */}
        <div className="col-span-8 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Live Agent Consensus Log</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-purple-400 animate-ping' : 'bg-slate-600'}`} />
              <span className={`text-[10px] font-mono uppercase ${isRunning ? 'text-purple-400' : 'text-slate-600'}`}>
                {isRunning ? 'Pipeline Active' : 'Standby'}
              </span>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-sm custom-scrollbar scroll-smooth">
            {logs.map((log, i) => {
              const tsMatch = log.match(/\[(\d{4}-[^\]]+)\]/);
              const ts = tsMatch ? tsMatch[1] : '';
              const rest = log.replace(`[${ts}]`, '').trim();
              const agentMatch = rest.match(/^\[([^\]]+)\]/);
              const agent = agentMatch ? agentMatch[1] : 'System';
              const msg = rest.replace(`[${agent}]`, '').trim();

              const cfg = AGENTS.find(a => a.name === agent);
              const color = cfg?.color || (agent === 'System' ? 'text-slate-300' : 'text-slate-400');
              const bg = cfg?.bgColor || 'bg-slate-500/10';

              return (
                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className={`w-9 h-9 rounded border border-slate-700 flex items-center justify-center shrink-0 ${bg}`}>
                    <Bot className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-[10px] ${color}`}>{agent}</span>
                      <span className="text-[9px] text-slate-600">{ts ? new Date(ts).toLocaleTimeString() : ''}</span>
                      {cfg && (
                        <span className="text-[7px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 ml-auto">
                          {cfg.model}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-[10px] leading-relaxed bg-slate-950/50 p-2.5 rounded-r-lg rounded-bl-lg border border-slate-800/50">
                      {msg}
                    </p>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                <Bot className="w-12 h-12 animate-bounce" />
                <p className="text-xs uppercase tracking-widest">Run the pipeline to see agent communication</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
