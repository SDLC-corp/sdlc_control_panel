import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import AuditTable from '../components/AuditTable.jsx';

export default function AuditPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await api('/audit-logs');
    setRows(data.auditLogs || []);
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
      <AuditTable rows={rows} />
    </>
  );
}
