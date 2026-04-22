import { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, Truck, DollarSign, TrendingUp, Globe } from 'lucide-react';

const STATUS_STYLE: Record<string, string> = {
  delivered:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  shipped:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  pending:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const CHANNEL_COLORS: Record<string, string> = {
  'Online Store':   'text-emerald-400',
  'Amazon':         'text-amber-400',
  'TikTok Shop':    'text-pink-400',
  'Instagram Shop': 'text-purple-400',
  'eBay':           'text-blue-400',
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [page, setPage] = useState(1);

  const PER_PAGE = 20;

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/ecom/orders?limit=200');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ecom/orders/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchOrders();
    } catch {}
    setGenerating(false);
  };

  const channels = ['All', ...Array.from(new Set(orders.map(o => o.channel).filter(Boolean)))];
  const statuses = ['All', 'delivered', 'shipped', 'processing', 'pending'];

  const filtered = orders.filter(o => {
    const sc = filterStatus === 'All' || o.status === filterStatus;
    const cc = filterChannel === 'All' || o.channel === filterChannel;
    return sc && cc;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const totalRev   = filtered.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const totalProfit = filtered.reduce((s, o) => s + parseFloat(o.profit || 0), 0);
  const avgOrder   = filtered.length ? totalRev / filtered.length : 0;

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/20 p-2.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Order Management — Auto Fulfillment</span>
          <span className="text-[9px] font-mono text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">{orders.length} total</span>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="p-1.5 bg-slate-800/50 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
              generating ? 'bg-slate-700 text-slate-500' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            }`}
          >
            {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
            {generating ? 'Generating...' : 'Simulate Orders'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Filtered Revenue', value: `$${totalRev.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Filtered Profit',  value: `$${totalProfit.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`, icon: TrendingUp, color: 'text-cyan-400' },
          { label: 'Avg Order Value',  value: `$${avgOrder.toFixed(2)}`,  icon: ShoppingCart, color: 'text-purple-400' },
          { label: 'Filtered Orders',  value: filtered.length.toLocaleString(), icon: Globe, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-3 flex items-center gap-3">
            <s.icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
            <div>
              <div className="text-[8px] text-slate-500 uppercase font-mono">{s.label}</div>
              <div className={`text-sm font-bold ${s.color} font-mono`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase">Status:</span>
          {statuses.map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase transition-all border ${
                filterStatus === s ? 'bg-purple-600/30 border-purple-500/50 text-purple-400' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-500 font-mono uppercase">Channel:</span>
          {channels.map(c => (
            <button key={c} onClick={() => { setFilterChannel(c); setPage(1); }}
              className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase transition-all border ${
                filterChannel === c ? 'bg-purple-600/30 border-purple-500/50 text-purple-400' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] font-mono">
            <thead className="bg-slate-900/60 sticky top-0 z-10">
              <tr className="text-slate-500 border-b border-slate-800/50">
                <th className="py-3 px-4 text-left font-medium uppercase">Order #</th>
                <th className="py-3 px-3 text-left font-medium uppercase">Product</th>
                <th className="py-3 px-3 text-right font-medium uppercase">Qty</th>
                <th className="py-3 px-3 text-right font-medium uppercase">Unit Price</th>
                <th className="py-3 px-3 text-right font-medium uppercase">Total</th>
                <th className="py-3 px-3 text-right font-medium uppercase">Profit</th>
                <th className="py-3 px-3 text-left font-medium uppercase">Channel</th>
                <th className="py-3 px-3 text-left font-medium uppercase">Region</th>
                <th className="py-3 px-3 text-left font-medium uppercase">Date</th>
                <th className="py-3 px-3 text-right font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="py-8 text-center text-slate-600">Loading orders...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={10} className="py-8 text-center text-slate-600">No orders. Click "Simulate Orders" to generate sample data.</td></tr>
              ) : (
                paginated.map((o, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-4 text-emerald-400/80 font-bold">{o.order_number}</td>
                    <td className="py-2.5 px-3 text-slate-200 max-w-[150px] truncate">{o.product_name}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{o.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">${parseFloat(o.unit_price || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-bold">${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">+${parseFloat(o.profit || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`${CHANNEL_COLORS[o.channel] || 'text-slate-400'} font-bold`}>{o.channel}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{o.customer_region}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(o.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded border text-[7px] uppercase font-bold ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50">
            <span className="text-[8px] font-mono text-slate-500">
              Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-2 py-1 bg-slate-800 rounded text-[8px] font-mono text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors">
                Prev
              </button>
              {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                const pg = Math.max(1, page - 2) + i;
                return pg <= totalPages ? (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`px-2 py-1 rounded text-[8px] font-mono transition-colors ${pg === page ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
                    {pg}
                  </button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="px-2 py-1 bg-slate-800 rounded text-[8px] font-mono text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
