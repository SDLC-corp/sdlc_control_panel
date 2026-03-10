import { db, createId, nowIso } from '../data/store.js';

export function addAuditLog({
  customerId = null,
  instanceId = null,
  installationId = null,
  entityType,
  entityId,
  action,
  actor = 'system',
  reason = null,
  oldValue = null,
  newValue = null
}) {
  const row = {
    id: createId(),
    customerId,
    instanceId,
    installationId,
    entityType,
    entityId,
    action,
    actor,
    reason,
    oldValueJson: oldValue,
    newValueJson: newValue,
    createdAt: nowIso()
  };

  db.auditLogs.push(row);
  return row;
}
