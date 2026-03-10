import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function EntitlementsPage() {
  const [rows, setRows] = useState([]);
  const [notice, setNotice] = useState('');

  const load = async () => {
    const data = await api('/installations');
    setRows(data.installations || []);
  };

  useEffect(() => {
    load();
  }, []);

  const setState = async (installationId, state) => {
    await api(`/entitlements/${installationId}/override`, {
      method: 'POST',
      body: JSON.stringify({
        state,
        reason: `Manual change to ${state} from UI`,
        actor: 'admin'
      })
    });

    setNotice(`Entitlement changed to ${state}.`);
    await load();
  };

  if (!rows.length) {
    return <div className="panel">No installations yet. Bootstrap demo data first.</div>;
  }

  return (
    <>
      {notice ? <div className="notice">{notice}</div> : null}
      <div className="card-list">
        {rows.map((row) => (
          <div className="card" key={row.id}>
            <h3>{row.product?.name || row.productId}</h3>
            <p>Customer: {row.customer?.name || '-'}</p>
            <p>State: {row.entitlement?.state || '-'}</p>
            <p>Plan: {row.entitlement?.planCode || '-'}</p>
            <p>Manual override: {row.entitlement?.manualOverride ? 'Yes' : 'No'}</p>

            <div className="inline-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setState(row.id, 'free')}
              >
                Set Free
              </button>
              <button
                className="action-button"
                type="button"
                onClick={() => setState(row.id, 'active')}
              >
                Set Active
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => setState(row.id, 'expired')}
              >
                Set Expired
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
