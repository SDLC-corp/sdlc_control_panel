import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import HealthExceptionsPanel from '../components/HealthExceptionsPanel.jsx';

export default function HealthPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await api('/health/exceptions');
    setRows(data.exceptions || []);
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
      <HealthExceptionsPanel rows={rows} />
    </>
  );
}
