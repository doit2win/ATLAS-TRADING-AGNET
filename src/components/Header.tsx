import { Activity, Clock, Network, LayoutDashboard, History, Bot, ShoppingCart, Package, TrendingUp, BarChart2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tradingNav = [
    { name: 'Trading',  path: '/',        icon: LayoutDashboard },
    { name: 'Agents',   path: '/matrix',  icon: Bot             },
    { name: 'History',  path: '/history', icon: History         },
  ];

  const shopNav = [
    { name: 'Shop',     path: '/shop',          icon: ShoppingCart },
    { name: 'Products', path: '/shop/products', icon: Package      },
    { name: 'Orders',   path: '/shop/orders',   icon: BarChart2    },
    { name: 'Revenue',  path: '/shop/revenue',  icon: TrendingUp   },
  ];

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#0B0E14]/90 backdrop-blur-sm z-50 relative">
      <div className="flex items-center gap-5">
        <Link to="/" className="flex items-center gap-2 text-emerald-400 font-mono group shrink-0">
          <Activity className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-wider text-[11px]">ATLAS | AI Commerce</span>
        </Link>

        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-mono text-slate-600 uppercase mr-1 tracking-widest">Trading</span>
          {tradingNav.map(item => {
            const Icon = item.icon;
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path) && !location.pathname.startsWith('/shop');
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-widest transition-all ${
                  active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                         : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}>
                <Icon className="w-3 h-3" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="h-5 w-px bg-slate-800" />

        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-mono text-slate-600 uppercase mr-1 tracking-widest">E-Com</span>
          {shopNav.map(item => {
            const Icon = item.icon;
            const active = item.path === '/shop'
              ? location.pathname === '/shop'
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-widest transition-all ${
                  active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                         : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}>
                <Icon className="w-3 h-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 text-[9px]">LIVE SYNC</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <Clock className="w-3 h-3" />
          <span className="text-slate-300 text-[9px]">
            {time.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <Network className="w-3 h-3" />
          <span className="text-[9px]">5 Channels Active</span>
        </div>
      </div>
    </header>
  );
}
