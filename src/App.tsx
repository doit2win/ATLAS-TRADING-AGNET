import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentMatrix from './pages/AgentMatrix';
import TradeHistory from './pages/TradeHistory';
import Leaderboard from './pages/Leaderboard';
import ShopDashboard from './pages/ShopDashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Revenue from './pages/Revenue';
import EcomMatrix from './pages/EcomMatrix';
import Integrations from './pages/Integrations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="matrix" element={<AgentMatrix />} />
          <Route path="history" element={<TradeHistory />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="shop" element={<ShopDashboard />} />
          <Route path="shop/products" element={<Products />} />
          <Route path="shop/orders" element={<Orders />} />
          <Route path="shop/revenue" element={<Revenue />} />
          <Route path="shop/matrix" element={<EcomMatrix />} />
          <Route path="shop/integrations" element={<Integrations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
