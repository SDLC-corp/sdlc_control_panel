import React from 'react';

const tabs = [
  ['dashboard', 'Dashboard'],
  ['installations', 'Installations'],
  ['entitlements', 'Entitlements'],
  ['health', 'Health'],
  ['releases', 'Releases'],
  ['audit', 'Audit'],
  ['support', 'Support']
];

export default function NavTabs({ current, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          className={`tab-button ${current === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
