import express from 'express';
import { db, createId, nowIso } from '../data/store.js';
import { addAuditLog } from '../services/auditService.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { installationId, type, payload = {}, actor = 'admin' } = req.body;
  const installation = db.installations.get(installationId);

  if (!installation) {
    return res.status(404).json({ error: 'Installation not found' });
  }

  if (!type) {
    return res.status(400).json({ error: 'type is required' });
  }

  const command = {
    id: createId(),
    installationId,
    instanceId: installation.instanceId,
    type,
    payload,
    status: 'pending',
    createdBy: actor,
    createdAt: nowIso(),
    ackedAt: null
  };

  db.remoteCommands.set(command.id, command);

  addAuditLog({
    customerId: installation.customerId,
    instanceId: installation.instanceId,
    installationId: installation.id,
    entityType: 'command',
    entityId: command.id,
    action: 'queued',
    actor,
    reason: `Command queued: ${type}`,
    newValue: command
  });

  return res.status(201).json({ ok: true, command });
});

router.get('/poll/:instanceId', (req, res) => {
  const commands = Array.from(db.remoteCommands.values()).filter(
    (command) => command.instanceId === req.params.instanceId && command.status === 'pending'
  );

  return res.json({ commands });
});

router.post('/ack/:commandId', (req, res) => {
  const command = db.remoteCommands.get(req.params.commandId);

  if (!command) {
    return res.status(404).json({ error: 'Command not found' });
  }

  const previous = { ...command };
  command.status = 'acked';
  command.ackedAt = nowIso();

  const installation = db.installations.get(command.installationId);

  addAuditLog({
    customerId: installation?.customerId || null,
    instanceId: command.instanceId,
    installationId: command.installationId,
    entityType: 'command',
    entityId: command.id,
    action: 'acked',
    actor: req.body.actor || 'odoo-client',
    oldValue: previous,
    newValue: command
  });

  return res.json({ ok: true, command });
});

export default router;
