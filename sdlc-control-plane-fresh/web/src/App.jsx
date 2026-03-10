import React, { useState } from 'react';
import NavTabs from './components/NavTabs.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InstallationsPage from './pages/InstallationsPage.jsx';
import EntitlementsPage from './pages/EntitlementsPage.jsx';
import HealthPage from './pages/HealthPage.jsx';
import ReleasesPage from './pages/ReleasesPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import SupportPage from './pages/SupportPage.jsx';

export default function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>SDLC Control Plane</h1>
        <p>
          Manage per-app entitlements, version compatibility, health signals, support notes,
          and audit history for your Odoo apps.
        </p>
      </header>

      <NavTabs current={tab} onChange={setTab} />

      {tab === 'dashboard' && <DashboardPage />}
      {tab === 'installations' && <InstallationsPage />}
      {tab === 'entitlements' && <EntitlementsPage />}
      {tab === 'health' && <HealthPage />}
      {tab === 'releases' && <ReleasesPage />}
      {tab === 'audit' && <AuditPage />}
      {tab === 'support' && <SupportPage />}
    </div>
  );
}
