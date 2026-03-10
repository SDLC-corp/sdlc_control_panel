import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function ReleasesPage() {
  const [data, setData] = useState({ summary: {}, items: [] });

  const load = async () => {
    const response = await api('/releases/summary');
    setData(response);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="toolbar">
        <button className="secondary-button" type="button" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="panel">
        <pre style={{ margin: 0, overflowX: 'auto' }}>
          {JSON.stringify(data.summary, null, 2)}
        </pre>
      </div>

      <div className="card-list">
        {data.items.map((item) => (
          <div className="card" key={item.installationId}>
            <h3>{item.productName || item.productCode}</h3>
            <p>Customer: {item.customerName || '-'}</p>
            <p>Installed: {item.installedVersion}</p>
            <p>Latest: {item.latestAvailableVersion}</p>
            <p>Odoo: {item.odooVersion}</p>
            <p>Compatibility: {item.compatibilityStatus}</p>
            <p>Release channel: {item.releaseChannel}</p>
            <p>Upgrade needed: {item.upgradeNeeded ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </>
  );
}
