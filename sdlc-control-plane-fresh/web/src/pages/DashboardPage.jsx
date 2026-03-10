import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import SummaryGrid from '../components/SummaryGrid.jsx';

export default function DashboardPage() {
  const [summary, setSummary] = useState({});
  const [notice, setNotice] = useState('');

  const load = async () => {
    const data = await api('/dashboard');
    setSummary(data.summary || {});
  };

  useEffect(() => {
    load();
  }, []);

  const bootstrapDemo = async () => {
    await api('/demo/bootstrap', { method: 'POST' });
    setNotice('Demo data created.');
    await load();
  };

  return (
    <>
      {notice ? <div className="notice">{notice}</div> : null}
      <div className="toolbar">
        <button className="action-button" type="button" onClick={bootstrapDemo}>
          Bootstrap Demo Data
        </button>
        <button className="secondary-button" type="button" onClick={load}>
          Refresh Summary
        </button>
      </div>
      <SummaryGrid summary={summary} />
    </>
  );
}
