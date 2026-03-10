import React from 'react';

export default function AuditTable({ rows }) {
  return (
    <div className="table-wrap panel">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Entity</th>
            <th>Action</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.createdAt}</td>
              <td>{row.actor}</td>
              <td>{row.entityType}</td>
              <td>{row.action}</td>
              <td>{row.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
