import React from 'react';

export default function HealthExceptionsPanel({ rows }) {
  if (!rows.length) {
    return <div className="panel">No active exceptions.</div>;
  }

  return (
    <div className="card-list">
      {rows.map((row) => (
        <div className="card" key={row.id}>
          <h3>{row.product?.name || row.productId}</h3>
          <p className="muted">{row.customer?.name || 'Unknown customer'}</p>
          <p>Health: {row.healthStatus}</p>
          <p>Heartbeat: {row.heartbeatStatus}</p>
          <p>Failure streak: {row.failureStreak || 0}</p>
          <p>Error: {row.lastErrorMessage || '-'}</p>
        </div>
      ))}
    </div>
  );
}
