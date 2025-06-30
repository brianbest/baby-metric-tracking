import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import BabyManagement from './pages/BabyManagement';
import Settings from './pages/Settings';

function App() {
  const { i18n } = useTranslation();

  // Set document direction for RTL support
  React.useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/babies" element={<BabyManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
