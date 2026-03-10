import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import InstallationsTable from '../components/InstallationsTable.jsx';

export default function InstallationsPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await api('/installations');
    setRows(data.installations || []);
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
      <InstallationsTable rows={rows} />
    </>
  );
}
