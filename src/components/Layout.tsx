import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Ticker from './Ticker';
import PriceTicker from './PriceTicker';
import { Bot, Trophy, ShoppingCart, TrendingUp, Package, Cpu, Plug, Zap, Sparkles } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isShop = location.pathname.startsWith('/shop');

  return (
    <div className="h-screen flex flex-col bg-[#0B0E14] text-slate-300 relative overflow-hidden">
      <PriceTicker />
      <Header />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Floating Agents Button */}
        <button
          onClick={() => navigate('/matrix')}
          className="fixed left-0 top-[22%] -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/30 group"
        >
          <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Agents</span>
        </button>

        {/* Floating Leaderboard Button */}
        <button
          onClick={() => navigate('/leaderboard')}
          className="fixed left-0 top-[38%] -translate-y-1/2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all shadow-[0_0_20px_rgba(202,138,4,0.3)] border border-yellow-400/30 group"
        >
          <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Rank</span>
        </button>

        {/* Floating Brand Button */}
        <button
          onClick={() => navigate('/shop/brand')}
          className={`fixed left-0 top-[46%] -translate-y-1/2 font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all border group ${
            location.pathname === '/shop/brand'
              ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-400/60'
              : 'bg-amber-700 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-400/30'
          } text-white`}
        >
          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Brand</span>
        </button>

        {/* Floating Shop Button */}
        <button
          onClick={() => navigate('/shop')}
          className={`fixed left-0 top-[56%] -translate-y-1/2 font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all border group ${
            isShop
              ? 'bg-purple-500 hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] border-purple-400/60'
              : 'bg-purple-700 hover:bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] border-purple-400/30'
          } text-white`}
        >
          <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Shop</span>
        </button>

        {/* Floating Products Button */}
        <button
          onClick={() => navigate('/shop/products')}
          className="fixed left-0 top-[68%] -translate-y-1/2 bg-blue-700 hover:bg-blue-600 text-white font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/30 group"
        >
          <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Products</span>
        </button>

        {/* Floating Revenue Button */}
        <button
          onClick={() => navigate('/shop/revenue')}
          className="fixed left-0 top-[78%] -translate-y-1/2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/30 group"
        >
          <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Revenue</span>
        </button>

        {/* Floating AutoPilot Button */}
        <button
          onClick={() => navigate('/shop/autopilot')}
          className={`fixed left-0 top-[78%] -translate-y-1/2 font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all border group ${
            location.pathname === '/shop/autopilot'
              ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-400/60'
              : 'bg-amber-700 hover:bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-400/30'
          } text-white`}
        >
          <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Pilot</span>
        </button>

        {/* Floating Content Button */}
        <button
          onClick={() => navigate('/shop/content')}
          className={`fixed left-0 top-[86%] -translate-y-1/2 font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all border group ${
            location.pathname === '/shop/content'
              ? 'bg-pink-500 hover:bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)] border-pink-400/60'
              : 'bg-pink-800 hover:bg-pink-700 shadow-[0_0_20px_rgba(236,72,153,0.2)] border-pink-400/20'
          } text-white`}
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Content</span>
        </button>

        {/* Floating E-Com Matrix Button */}
        <button
          onClick={() => navigate('/shop/matrix')}
          className="fixed left-0 top-[93%] -translate-y-1/2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/30 group"
        >
          <Cpu className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Matrix</span>
        </button>

        {/* Floating Integrations Button */}
        <button
          onClick={() => navigate('/shop/integrations')}
          className={`fixed left-0 top-[99%] -translate-y-1/2 font-bold py-4 px-1 rounded-r-lg flex flex-col items-center gap-2 z-50 transition-all border group ${
            location.pathname === '/shop/integrations'
              ? 'bg-rose-500 hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] border-rose-400/60'
              : 'bg-rose-700 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-400/30'
          } text-white`}
        >
          <Plug className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-widest">Connect</span>
        </button>

        <Outlet />
      </main>

      <Ticker />
    </div>
  );
}
