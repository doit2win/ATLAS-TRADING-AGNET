import { useState, useEffect } from 'react';
import { Package, Zap, RefreshCw, Search, Star, TrendingUp, ShoppingBag } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Electronics':      'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Beauty & Skincare':'text-pink-400 bg-pink-500/10 border-pink-500/30',
  'Home & Decor':     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Health & Wellness':'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Sports & Fitness': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'Pets':             'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourcing, setSourcing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortBy, setSortBy] = useState<'ai_score' | 'margin_pct' | 'sale_price'>('ai_score');
  const [swarmLog, setSwarmLog] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/ecom/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    const iv = setInterval(fetchProducts, 15000);
    return () => clearInterval(iv);
  }, []);

  const handleSourceProducts = async () => {
    setSourcing(true);
    const ts = () => new Date().toISOString().split('T')[1].slice(0,8);
    setSwarmLog([`[${ts()}] [System] 🚀 Launching product sourcing swarm...`]);
    try {
      const res = await fetch('/api/ecom/swarm/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: filterCat === 'All' ? '' : filterCat }),
      });
      const data = await res.json();
      if (data.success) {
        setSwarmLog(prev => [
          `[${ts()}] [Scout-Claude] ✅ ${data.savedProducts?.length || 0} products sourced`,
          `[${ts()}] [Validator-Gemini] Market validation complete`,
          `[${ts()}] [Copy-Llama] Product descriptions generated`,
          `[${ts()}] [Pricer-Llama] Pricing optimized for max margin`,
          `[${ts()}] [Nexus] Products listed to store — ${data.result?.decision}`,
          ...prev
        ]);
        await fetchProducts();
      }
    } catch (e: any) {
      setSwarmLog(prev => [`[${ts()}] [System] ⚠️ ${e.message}`, ...prev]);
    } finally {
      setSourcing(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.category || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'All' || p.category === filterCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => parseFloat(b[sortBy] || 0) - parseFloat(a[sortBy] || 0));

  const avgMargin = products.length ? (products.reduce((s, p) => s + parseFloat(p.margin_pct || 0), 0) / products.length).toFixed(1) : '0';
  const totalStock = products.reduce((s, p) => s + parseInt(p.stock_count || 0), 0);

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/20 p-2.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">AI-Sourced Product Catalog</span>
          <span className="text-[9px] font-mono text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">{products.length} products</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} className="p-1.5 bg-slate-800/50 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={handleSourceProducts}
            disabled={sourcing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
              sourcing ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {sourcing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-current" />}
            {sourcing ? 'Sourcing...' : 'Source with AI'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Products',  value: products.length.toString(),        icon: Package,     color: 'text-emerald-400' },
          { label: 'Avg Margin',      value: `${avgMargin}%`,                   icon: TrendingUp,  color: 'text-cyan-400'   },
          { label: 'Total Stock',     value: totalStock.toLocaleString(),        icon: ShoppingBag, color: 'text-purple-400' },
          { label: 'AI Avg Score',    value: `${products.length ? (products.reduce((s, p) => s + parseFloat(p.ai_score || 0), 0) / products.length).toFixed(1) : '0'}/100`, icon: Star, color: 'text-amber-400' },
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

      {/* Swarm Log (when sourcing) */}
      {swarmLog.length > 0 && (
        <div className="bg-[#05070A] border border-emerald-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full ${sourcing ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[9px] font-mono text-emerald-400 uppercase">Swarm Pipeline Log</span>
          </div>
          <div className="font-mono text-[9px] space-y-0.5 text-slate-400 max-h-28 overflow-y-auto">
            {swarmLog.map((l, i) => <div key={i} className="text-slate-400">{l}</div>)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-[10px] font-mono text-slate-300 placeholder-slate-600 outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all border ${
                filterCat === cat ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="bg-slate-800/60 border border-slate-700 rounded text-[10px] font-mono text-slate-300 px-2 py-1.5"
        >
          <option value="ai_score">Sort: AI Score</option>
          <option value="margin_pct">Sort: Margin %</option>
          <option value="sale_price">Sort: Price</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-[9px] font-mono">
            <thead className="bg-slate-900/60 sticky top-0 z-10">
              <tr className="text-slate-500 border-b border-slate-800/50">
                <th className="py-3 px-4 text-left font-medium uppercase tracking-tighter">Product</th>
                <th className="py-3 px-3 text-left font-medium uppercase tracking-tighter">Category</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">Cost</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">Price</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">Margin</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">Stock</th>
                <th className="py-3 px-3 text-left font-medium uppercase tracking-tighter">Supplier</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">AI Score</th>
                <th className="py-3 px-3 text-right font-medium uppercase tracking-tighter">Sourced By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-600">Loading products...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-600">No products found. Click "Source with AI" to populate the catalog.</td></tr>
              ) : (
                filtered.map((p, i) => {
                  const margin = parseFloat(p.margin_pct || 0);
                  const score = parseFloat(p.ai_score || 0);
                  const catStyle = CATEGORY_COLORS[p.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';
                  return (
                    <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group">
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="text-slate-200 font-bold truncate">{p.name}</div>
                        <div className="text-slate-600 text-[7px] mt-0.5 truncate">{p.description?.slice(0, 60)}...</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded border text-[7px] uppercase font-bold ${catStyle}`}>{p.category}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">${parseFloat(p.cost_price || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-slate-200 font-bold">${parseFloat(p.sale_price || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-bold ${margin >= 65 ? 'text-emerald-400' : margin >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">{parseInt(p.stock_count || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-400 max-w-[100px] truncate">{p.supplier}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`${score >= 90 ? 'text-emerald-400' : score >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>{score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[7px] px-1.5 py-0.5 rounded uppercase font-bold ${p.sourced_by === 'Scout-Claude' ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'}`}>
                          {p.sourced_by || 'Manual'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
