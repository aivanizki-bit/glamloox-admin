import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './store/AdminStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Courses from './pages/Courses';
import Events from './pages/Events';
import CommunityPage from './pages/CommunityPage';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import RewardsPage from './pages/RewardsPage';
import SettingsPage from './pages/SettingsPage';
import Aktionen from './pages/Aktionen';

function Protected({ children }: { children: React.ReactNode }) {
  const { authed } = useAdmin();
  if (!authed) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AdminProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/produkte" element={<Protected><Products /></Protected>} />
          <Route path="/kurse" element={<Protected><Courses /></Protected>} />
          <Route path="/events" element={<Protected><Events /></Protected>} />
          <Route path="/aktionen" element={<Protected><Aktionen /></Protected>} />
          <Route path="/community" element={<Protected><CommunityPage /></Protected>} />
          <Route path="/bestellungen" element={<Protected><Orders /></Protected>} />
          <Route path="/mitteilungen" element={<Protected><Notifications /></Protected>} />
          <Route path="/rewards" element={<Protected><RewardsPage /></Protected>} />
          <Route path="/einstellungen" element={<Protected><SettingsPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AdminProvider>
  );
}
