import { useState, useEffect } from 'react';
import {
  Link2, CheckCircle, XCircle, RefreshCw, Zap, ShoppingBag,
  Truck, Package, ArrowRight, AlertTriangle, ExternalLink,
  Copy, ChevronDown, ChevronUp, Globe, DollarSign
} from 'lucide-react';

const SUPPLIER_INFO = [
  {
    key: 'dsers',
    name: 'DSers',
    subtitle: 'AliExpress Dropshipping',
    logo: '🛒',
    envKey: 'DSERS_API_KEY',
    note: 'Global · 10–20 day shipping · Lowest cost',
    docsUrl: 'https://developers.dsers.com',
    setupSteps: [
      'Go to dsers.com → Settings → API',
      'Generate an API key',
      'Copy and paste as DSERS_API_KEY in your .env',
    ],
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
  },
  {
    key: 'spocket',
    name: 'Spocket',
    subtitle: 'US / EU Suppliers',
    logo: '🚀',
    envKey: 'SPOCKET_API_KEY',
    note: 'US/EU only · 2–7 day shipping · Premium quality',
    docsUrl: 'https://app.spocket.co/integrations/api',
    setupSteps: [
      'Go to app.spocket.co → Settings → Integrations → API',
      'Click "Generate API Key"',
      'Copy and paste as SPOCKET_API_KEY in your .env',
    ],
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
  },
  {
    key: 'cj',
    name: 'CJ Dropshipping',
    subtitle: 'Global Warehouse Network',
    logo: '📦',
    envKey: 'CJ_API_KEY',
    note: 'Global · 7–15 days · Quality control + US warehouse',
    docsUrl: 'https://developers.cjdropshipping.com',
    setupSteps: [
      'Create account at cjdropshipping.com',
      'Go to Settings → API',
      'Set CJ_EMAIL=your@email.com and CJ_API_KEY=your_password in .env',
    ],
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
  },
];

interface SyncResult { name: string; success: boolean; shopifyProductId?: number; simulated?: boolean; error?: string; }

export default function Integrations() {
  const [shopifyStatus, setShopifyStatus]     = useState<any>(null);
  const [supplierStatus, setSupplierStatus]   = useState<any>(null);
  const [syncing, setSyncing]                 = useState(false);
  const [syncingOrders, setSyncingOrders]     = useState(false);
  const [routingOrders, setRoutingOrders]     = useState(false);
  const [syncResults, setSyncResults]         = useState<SyncResult[]>([]);
  const [routeResults, setRouteResults]       = useState<any[]>([]);
  const [orderSyncResult, setOrderSyncResult] = useState<any>(null);
  const [logs, setLogs]                       = useState<string[]>([]);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [copiedKey, setCopiedKey]             = useState('');

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

  const fetchStatus = async () => {
    try {
      const [shopRes, supRes] = await Promise.all([
        fetch('/api/shopify/status'),
        fetch('/api/supplier/status'),
      ]);
      const [shopData, supData] = await Promise.all([shopRes.json(), supRes.json()]);
      if (shopData.success) setShopifyStatus(shopData);
      if (supData.success)  setSupplierStatus(supData);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSyncProducts = async () => {
    setSyncing(true);
    setSyncResults([]);
    addLog('Syncing all active products to Shopify...');
    try {
      const res  = await fetch('/api/shopify/sync-products', { method: 'POST' });
      const data = await res.json();
      if (data.results) setSyncResults(data.results);
      addLog(`Sync complete — ${data.synced} published, ${data.failed} failed${data.results?.[0]?.simulated ? ' (simulated — add SHOPIFY keys to go live)' : ''}`);
    } catch (e: any) { addLog(`Error: ${e.message}`); }
    setSyncing(false);
  };

  const handleSyncOrders = async () => {
    setSyncingOrders(true);
    setOrderSyncResult(null);
    addLog('Pulling orders from Shopify...');
    try {
      const res  = await fetch('/api/shopify/sync-orders', { method: 'POST' });
      const data = await res.json();
      setOrderSyncResult(data);
      addLog(`Shopify orders: ${data.fetched} fetched, ${data.imported} imported to DB${data.simulated ? ' (simulated)' : ''}`);
    } catch (e: any) { addLog(`Error: ${e.message}`); }
    setSyncingOrders(false);
  };

  const handleRouteOrders = async () => {
    setRoutingOrders(true);
    setRouteResults([]);
    addLog('Routing all unfulfilled orders to suppliers...');
    try {
      const res  = await fetch('/api/supplier/route-all', { method: 'POST' });
      const data = await res.json();
      if (data.results) setRouteResults(data.results);
      addLog(`Routing complete — ${data.routed} routed, ${data.failed} failed`);
    } catch (e: any) { addLog(`Error: ${e.message}`); }
    setRoutingOrders(false);
  };

  const handleRegisterWebhooks = async () => {
    addLog('Registering Shopify webhooks...');
    try {
      const res  = await fetch('/api/shopify/register-webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });
      const data = await res.json();
      addLog(`Webhooks: ${data.registered?.join(', ')} registered`);
    } catch (e: any) { addLog(`Error: ${e.message}`); }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedKey(key); setTimeout(() => setCopiedKey(''), 2000); });
  };

  const shopifyConnected = shopifyStatus?.connected;
  const activeSuppliers  = supplierStatus?.activeSuppliers || [];

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-scroll custom-scrollbar bg-[#0B0E14] text-slate-300 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/20 p-2.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-3">
          <Link2 className="w-4 h-4 text-indigo-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Integrations — Shopify + Suppliers</span>
        </div>
        <button onClick={fetchStatus} className="p-1.5 bg-slate-800/50 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT COLUMN */}
        <div className="col-span-7 flex flex-col gap-4">

          {/* ── Shopify Store Card ── */}
          <div className={`rounded-xl border p-5 relative overflow-hidden ${shopifyConnected ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-slate-900/30 border-slate-700/60'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${shopifyConnected ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                  🛍️
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Shopify Store</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                    {shopifyConnected
                      ? `Connected · ${shopifyStatus?.shop?.name || shopifyStatus?.shop?.domain}`
                      : shopifyStatus?.configured
                        ? 'Verifying connection...'
                        : 'Not configured'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shopifyConnected
                  ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                  : <XCircle   className="w-4 h-4 text-slate-600" />}
                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${shopifyConnected ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-500 border-slate-700 bg-slate-800/40'}`}>
                  {shopifyConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            {!shopifyStatus?.configured && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-[9px] font-mono text-amber-300 space-y-1.5">
                    <div className="font-bold">Add these to your .env to connect:</div>
                    {[
                      { key: 'SHOPIFY_STORE_URL', hint: 'yourstore.myshopify.com' },
                      { key: 'SHOPIFY_ACCESS_TOKEN', hint: 'shpat_xxxxxxxxxxxxxxxxxxxx' },
                    ].map(({ key, hint }) => (
                      <div key={key} className="flex items-center gap-2 bg-slate-950/60 rounded px-2 py-1">
                        <span className="text-slate-300">{key}=</span>
                        <span className="text-slate-500 italic">{hint}</span>
                        <button onClick={() => copyToClipboard(`${key}=`, key)}
                          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors">
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                        {copiedKey === key && <span className="text-emerald-400 text-[7px]">Copied!</span>}
                      </div>
                    ))}
                    <div className="text-slate-500 pt-1">
                      Get from: Shopify Admin → Settings → Apps → Develop apps → Create an app → Configure Admin API scopes (read/write_products, read/write_orders)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shopifyConnected && shopifyStatus?.shop && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Plan',    value: shopifyStatus.shop.plan_display_name || 'Basic' },
                  { label: 'Domain',  value: shopifyStatus.shop.domain             || '—' },
                  { label: 'Country', value: shopifyStatus.shop.country_name       || '—' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900/50 rounded p-2 border border-slate-800/50">
                    <div className="text-[7px] text-slate-500 uppercase font-mono">{s.label}</div>
                    <div className="text-[9px] text-slate-200 font-mono truncate">{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={handleSyncProducts} disabled={syncing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${syncing ? 'bg-slate-700 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}>
                {syncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 fill-current" />}
                {syncing ? 'Syncing Products...' : 'Sync Products → Shopify'}
              </button>
              <button onClick={handleSyncOrders} disabled={syncingOrders}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${syncingOrders ? 'bg-slate-700 text-slate-500' : 'bg-blue-700 hover:bg-blue-600 text-white'}`}>
                {syncingOrders ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                {syncingOrders ? 'Importing...' : 'Pull Shopify Orders'}
              </button>
              <button onClick={handleRegisterWebhooks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all">
                <Globe className="w-3 h-3" />
                Register Webhooks
              </button>
            </div>

            {/* Sync Results */}
            {syncResults.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                {syncResults.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[8px] font-mono p-1.5 rounded ${r.success ? 'bg-emerald-500/5 text-emerald-400' : 'bg-rose-500/5 text-rose-400'}`}>
                    {r.success ? <CheckCircle className="w-2.5 h-2.5 shrink-0" /> : <XCircle className="w-2.5 h-2.5 shrink-0" />}
                    <span className="truncate">{r.name}</span>
                    {r.shopifyProductId && <span className="ml-auto text-slate-500 shrink-0">ID: {r.shopifyProductId}{r.simulated ? ' (sim)' : ''}</span>}
                    {r.error && <span className="ml-auto text-rose-400 shrink-0 truncate max-w-[120px]">{r.error}</span>}
                  </div>
                ))}
              </div>
            )}

            {orderSyncResult && (
              <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-mono text-blue-300">
                ✅ Shopify orders: {orderSyncResult.fetched} fetched · {orderSyncResult.imported} imported
                {orderSyncResult.simulated && <span className="text-slate-500 ml-1">(simulated — add keys to go live)</span>}
              </div>
            )}
          </div>

          {/* ── Supplier Cards ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Dropshipping Suppliers</span>
              <span className="ml-auto text-[9px] font-mono text-slate-500">
                {activeSuppliers.length > 0 ? `${activeSuppliers.length} active` : 'Running in simulation mode'}
              </span>
            </div>

            {SUPPLIER_INFO.map((sup) => {
              const configured = supplierStatus?.suppliers?.[sup.key]?.configured ?? false;
              const expanded = expandedSupplier === sup.key;
              return (
                <div key={sup.key} className={`rounded-lg border ${configured ? sup.border : 'border-slate-700/60'} ${configured ? sup.bg : 'bg-slate-900/20'} overflow-hidden`}>
                  <button className="w-full flex items-center gap-3 p-3.5 text-left"
                    onClick={() => setExpandedSupplier(expanded ? null : sup.key)}>
                    <span className="text-xl">{sup.logo}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${configured ? sup.color : 'text-slate-400'}`}>{sup.name}</span>
                        <span className={`text-[7px] px-1.5 py-0.5 rounded border uppercase font-bold ${configured ? `${sup.color} ${sup.border} ${sup.bg}` : 'text-slate-500 border-slate-700 bg-slate-800/40'}`}>
                          {configured ? 'Connected' : 'Not set'}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono mt-0.5">{sup.note}</div>
                    </div>
                    {configured
                      ? <CheckCircle className={`w-4 h-4 ${sup.color} shrink-0`} />
                      : <XCircle className="w-4 h-4 text-slate-600 shrink-0" />}
                    {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 border-t border-slate-800/50 pt-3">
                      <div className="text-[9px] font-mono text-slate-400 font-bold uppercase mb-2">Setup Instructions</div>
                      <ol className="space-y-1.5 mb-3">
                        {sup.setupSteps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-[9px] font-mono text-slate-400">
                            <span className={`shrink-0 w-4 h-4 rounded-full ${sup.bg} ${sup.border} border flex items-center justify-center text-[7px] font-bold ${sup.color}`}>{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950/60 rounded px-2 py-1 font-mono text-[8px] text-slate-400 border border-slate-800">
                          {sup.envKey}=your_key_here
                        </div>
                        <button onClick={() => copyToClipboard(`${sup.envKey}=`, sup.key)}
                          className="p-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                        {copiedKey === sup.key && <span className="text-emerald-400 text-[8px] font-mono">Copied!</span>}
                        <a href={sup.docsUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800 rounded border border-slate-700 hover:bg-slate-700 transition-colors">
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={handleRouteOrders} disabled={routingOrders}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${routingOrders ? 'bg-slate-700 text-slate-500' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'}`}>
              {routingOrders ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
              {routingOrders ? 'Routing Orders...' : 'Route All Unfulfilled Orders → Suppliers'}
            </button>

            {routeResults.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {routeResults.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 text-[8px] font-mono p-1.5 rounded ${r.success ? 'bg-emerald-500/5 text-emerald-300' : 'bg-rose-500/5 text-rose-300'}`}>
                    {r.success ? <CheckCircle className="w-2.5 h-2.5 shrink-0" /> : <XCircle className="w-2.5 h-2.5 shrink-0" />}
                    <span className="truncate">{r.productName}</span>
                    {r.success && <span className="ml-auto shrink-0 text-slate-500">{r.supplier?.toUpperCase()} · {r.estimatedDelivery}{r.simulated ? ' (sim)' : ''}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-5 flex flex-col gap-4">

          {/* Pipeline Flow */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Automated Order Flow</div>
            <div className="flex flex-col gap-1">
              {[
                { step: '1', label: 'Customer orders',        sub: 'Shopify checkout',           icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { step: '2', label: 'Webhook → ATLAS',        sub: 'Order saved to DB instantly', icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
                { step: '3', label: 'Smart supplier routing', sub: 'DSers · Spocket · CJ',        icon: Truck,       color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
                { step: '4', label: 'Tracking synced back',   sub: 'Shopify fulfillment updated', icon: Package,     color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
                { step: '5', label: 'Profit recorded',        sub: 'Revenue tracker updated',     icon: DollarSign,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10'    },
              ].map((s, i, arr) => (
                <div key={i}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/30">
                    <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                      <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[10px] font-bold ${s.color}`}>{s.label}</div>
                      <div className="text-[8px] text-slate-500 font-mono">{s.sub}</div>
                    </div>
                    <span className={`text-[8px] font-mono font-bold ${s.color} opacity-50`}>Step {s.step}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ArrowRight className="w-3 h-3 text-slate-700 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start Checklist */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Start Checklist</div>
            <div className="space-y-2">
              {[
                { done: !!process.env,        label: 'GROQ_API_KEY set',         note: 'console.groq.com (free)'      },
                { done: false,                label: 'ANTHROPIC_API_KEY set',    note: 'console.anthropic.com'         },
                { done: false,                label: 'GEMINI_API_KEY set',       note: 'aistudio.google.com (free)'   },
                { done: false,                label: 'DATABASE_URL set',         note: 'neon.tech (free tier)'         },
                { done: shopifyConnected,     label: 'Shopify store connected',  note: 'Add SHOPIFY_STORE_URL + TOKEN' },
                { done: activeSuppliers.length > 1, label: 'Supplier connected', note: 'DSers or Spocket API key'     },
                { done: false,               label: 'Webhooks registered',       note: 'Click Register Webhooks above' },
                { done: syncResults.length > 0, label: 'Products synced',        note: 'Click Sync Products above'    },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600 bg-transparent'}`}>
                    {item.done && <span className="text-[7px] text-white font-bold">✓</span>}
                  </div>
                  <div>
                    <div className={`text-[9px] font-mono font-bold ${item.done ? 'text-emerald-400 line-through opacity-60' : 'text-slate-300'}`}>{item.label}</div>
                    {!item.done && <div className="text-[7px] text-slate-600 font-mono">{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-[#05070A] border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Activity Log</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 font-mono text-[8px] max-h-48">
              {logs.length === 0
                ? <div className="text-slate-600 italic">Actions will appear here...</div>
                : logs.map((l, i) => (
                  <div key={i} className={`${l.includes('Error') ? 'text-rose-400' : l.includes('✅') || l.includes('complete') ? 'text-emerald-400' : 'text-slate-400'}`}>{l}</div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
