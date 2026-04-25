import { useState, useEffect } from 'react';
import { Zap, Play, RefreshCw, CheckCircle, XCircle, Clock, Bot,
         ShoppingCart, Package, TrendingUp, Plug, AlarmClock, BarChart3 } from 'lucide-react';

interface Job {
  id: string;
  name: string;
  description: string;
  intervalMs: number;
  lastRun: number;
  nextRun: number;
  runCount: number;
  status: 'idle' | 'running' | 'success' | 'error';
  lastResult?: string;
  enabled: boolean;
}

const JOB_ICONS: Record<string, any> = {
  scout:        Bot,
  routeOrders:  ShoppingCart,
  marketing:    TrendingUp,
  shopifySync:  Package,
  shopifyOrders: Plug,
  restock:      AlarmClock,
};

const JOB_COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  scout:         { text: 'text-orange-400',  bg: 'bg-orange-500/8',  border: 'border-orange-500/25',  glow: 'shadow-[0_0_12px_rgba(249,115,22,0.2)]'  },
  routeOrders:   { text: 'text-purple-400',  bg: 'bg-purple-500/8',  border: 'border-purple-500/25',  glow: 'shadow-[0_0_12px_rgba(168,85,247,0.2)]'  },
  marketing:     { text: 'text-pink-400',    bg: 'bg-pink-500/8',    border: 'border-pink-500/25',    glow: 'shadow-[0_0_12px_rgba(236,72,153,0.2)]'  },
  shopifySync:   { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]' },
  shopifyOrders: { text: 'text-blue-400',    bg: 'bg-blue-500/8',    border: 'border-blue-500/25',    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.2)]'  },
  restock:       { text: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/25',   glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]'  },
};

function fmtMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function countdown(nextRun: number): string {
  const diff = Math.max(0, nextRun - Date.now());
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (m > 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}m ${s}s`;
}

export default function AutoPilot() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [autoPilotActive, setAutoPilotActive] = useState(true);

  const fetchData = async () => {
    try {
      const [jobsRes, logRes, statsRes] = await Promise.all([
        fetch('/api/ecom/autopilot/jobs'),
        fetch('/api/ecom/autopilot/log'),
        fetch('/api/ecom/stats'),
      ]);
      const [jobsData, logData, statsData] = await Promise.all([
        jobsRes.json(), logRes.json(), statsRes.json()
      ]);
      if (jobsData.success) setJobs(jobsData.jobs);
      if (logData.success) setLog(logData.log);
      if (statsData.success) setStats(statsData);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(() => {
      setTick(t => t + 1);
      fetchData();
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const triggerJob = async (jobId: string) => {
    setRunning(jobId);
    try {
      await fetch(`/api/ecom/autopilot/run/${jobId}`, { method: 'POST' });
      await new Promise(r => setTimeout(r, 2000));
      await fetchData();
    } finally {
      setRunning(null);
    }
  };

  const toggleJob = async (jobId: string, enabled: boolean) => {
    await fetch(`/api/ecom/autopilot/toggle/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    await fetchData();
  };

  const runAll = async () => {
    for (const job of jobs.filter(j => j.enabled)) {
      await triggerJob(job.id);
    }
  };

  const totalRuns = jobs.reduce((s, j) => s + j.runCount, 0);
  const successJobs = jobs.filter(j => j.status === 'success').length;

  return (
    <div className="p-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${autoPilotActive ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-slate-800 border border-slate-700'}`}>
            <Zap className={`w-4 h-4 ${autoPilotActive ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <h1 className="text-[12px] font-black text-white uppercase tracking-widest">Do It 2 Win — AutoPilot</h1>
            <p className="text-[9px] font-mono text-slate-500 mt-0.5">6 automated jobs · Runs 24/7 · Zero human intervention required</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            autoPilotActive
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${autoPilotActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {autoPilotActive ? 'AUTOPILOT ON' : 'PAUSED'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPilotActive(!autoPilotActive)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${
              autoPilotActive
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-amber-500 border-amber-400 text-black hover:bg-amber-400'
            }`}
          >
            {autoPilotActive ? 'Pause All' : 'Activate'}
          </button>
          <button
            onClick={runAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Play className="w-3 h-3" /> Run All Now
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Job Runs', value: totalRuns.toString(), icon: RefreshCw, color: 'text-amber-400' },
          { label: 'Jobs Successful', value: `${successJobs}/${jobs.length}`, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Products in DB', value: stats?.products?.count || '–', icon: Package, color: 'text-purple-400' },
          { label: 'Avg AI Score', value: stats?.products?.avg_score ? `${parseFloat(stats.products.avg_score).toFixed(1)}` : '–', icon: BarChart3, color: 'text-cyan-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-950/60 border border-slate-800`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div>
              <div className={`text-lg font-black ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Job Cards */}
        <div className="col-span-8 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Scheduled Jobs</span>
          </div>
          {jobs.map(job => {
            const Icon = JOB_ICONS[job.id] || Zap;
            const c = JOB_COLORS[job.id] || JOB_COLORS.scout;
            const isRunning = running === job.id || job.status === 'running';
            return (
              <div key={job.id} className={`${c.bg} border ${c.border} ${job.status === 'running' ? c.glow : ''} rounded-xl p-4 transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg border ${c.border} ${c.bg} mt-0.5`}>
                      <Icon className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[11px] font-bold ${c.text} uppercase tracking-wider`}>{job.name}</span>
                        {/* Status badge */}
                        <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                          job.status === 'running' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' :
                          job.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          job.status === 'error'   ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {job.status === 'running' ? '● Running' : job.status === 'success' ? '✓ OK' : job.status === 'error' ? '✗ Error' : '◌ Idle'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed mb-2">{job.description}</p>
                      <div className="flex items-center gap-4 text-[8px] font-mono text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Every {fmtMs(job.intervalMs)}
                        </span>
                        {job.lastRun > 0 && (
                          <span>Last: {new Date(job.lastRun).toLocaleTimeString()}</span>
                        )}
                        {job.nextRun > Date.now() && (
                          <span className={c.text}>Next: {countdown(job.nextRun)}</span>
                        )}
                        <span>Runs: {job.runCount}</span>
                      </div>
                      {job.lastResult && (
                        <div className={`mt-2 text-[8px] font-mono ${job.status === 'error' ? 'text-rose-400' : 'text-slate-400'} truncate`}>
                          → {job.lastResult}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleJob(job.id, !job.enabled)}
                      className={`w-8 h-4 rounded-full border transition-all relative ${
                        job.enabled ? `${c.bg} ${c.border}` : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                        job.enabled ? `${c.text.replace('text-', 'bg-')} right-0.5` : 'bg-slate-600 left-0.5'
                      }`} />
                    </button>
                    {/* Manual trigger */}
                    <button
                      onClick={() => triggerJob(job.id)}
                      disabled={isRunning}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[9px] font-bold uppercase border transition-all ${
                        isRunning
                          ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                          : `${c.bg} ${c.border} ${c.text} hover:opacity-80`
                      }`}
                    >
                      {isRunning
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <Play className="w-3 h-3" />}
                      {isRunning ? 'Running' : 'Run'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Automation Log */}
        <div className="col-span-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Automation Log</span>
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex-1">
            <div className="font-mono text-[8px] space-y-1.5 overflow-y-auto max-h-[520px] custom-scrollbar pr-1">
              {log.length === 0 && (
                <p className="text-slate-600 text-center py-4">No automation events yet — jobs will appear here</p>
              )}
              {log.map((entry, i) => {
                const isSuccess = entry.includes('✅') || entry.includes('✓');
                const isError   = entry.includes('⚠️') || entry.includes('failed') || entry.includes('error');
                const isRunning = entry.includes('▶') || entry.includes('Starting');
                return (
                  <p key={i} className={
                    isSuccess ? 'text-emerald-400/80' :
                    isError   ? 'text-rose-400/80' :
                    isRunning ? 'text-amber-400/80' :
                    'text-slate-500'
                  }>
                    <span className="text-slate-700">{entry.match(/\[([\d\-T:.Z]+)\]/)?.[1]?.split('T')[1]?.slice(0,8) || ''} </span>
                    {entry.replace(/\[[\d\-T:.Z]+\] /, '')}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Automation Flow Diagram */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Automation Pipeline</div>
            <div className="flex flex-col gap-1.5">
              {[
                { step: '1', label: 'Scout sources products', color: 'text-orange-400', dot: 'bg-orange-400' },
                { step: '2', label: 'Marketing generates campaigns', color: 'text-pink-400', dot: 'bg-pink-400' },
                { step: '3', label: 'Shopify sync publishes live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                { step: '4', label: 'Order puller ingests sales', color: 'text-blue-400', dot: 'bg-blue-400' },
                { step: '5', label: 'Router sends to supplier', color: 'text-purple-400', dot: 'bg-purple-400' },
                { step: '6', label: 'Restock alerts prevent gaps', color: 'text-amber-400', dot: 'bg-amber-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-black ${s.dot}`}>{s.step}</div>
                  <span className={`text-[9px] font-mono ${s.color}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
