import React from 'react';

export default function InstallationsTable({ rows }) {
  return (
    <div className="table-wrap panel">
      <table>
        <thead>
          <tr>
            <th>App</th>
            <th>Customer</th>
            <th>Version</th>
            <th>Odoo</th>
            <th>Entitlement</th>
            <th>Health</th>
            <th>Release</th>
            <th>Upgrade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.product?.name || row.productId}</td>
              <td>{row.customer?.name || '-'}</td>
              <td>{row.installedVersion}</td>
              <td>{row.odooVersion}</td>
              <td>{row.entitlement?.state || '-'}</td>
              <td>{row.healthStatus}</td>
              <td>{row.releaseChannel}</td>
              <td>{row.upgradeNeeded ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
