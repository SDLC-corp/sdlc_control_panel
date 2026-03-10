import React from 'react';

export default function SummaryGrid({ summary }) {
  const items = Object.entries(summary || {});

  return (
    <div className="summary-grid">
      {items.map(([label, value]) => (
        <div className="stat-card" key={label}>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{String(value)}</div>
        </div>
      ))}
    </div>
  );
}
