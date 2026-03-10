import express from 'express';
import { db, getInstallationWithRelations, getInstallationsWithRelations, nowIso } from '../data/store.js';
import { addAuditLog } from '../services/auditService.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ installations: getInstallationsWithRelations() });
});

router.get('/:installationId', (req, res) => {
  const installation = db.installations.get(req.params.installationId);
  if (!installation) {
    return res.status(404).json({ error: 'Installation not found' });
  }

  return res.json(getInstallationWithRelations(installation));
});

router.patch('/:installationId', (req, res) => {
  const installation = db.installations.get(req.params.installationId);
  if (!installation) {
    return res.status(404).json({ error: 'Installation not found' });
  }

  const previous = { ...installation };
  const allowedFields = [
    'releaseChannel',
    'upgradeNeeded',
    'upgradePriority',
    'migrationRequired',
    'securityPatchRequired',
    'compatibilityStatus',
    'manualAttentionNeeded',
    'installedVersion',
    'latestAvailableVersion'
  ];

  for (const field of allowedFields) {
    if (field in req.body) {
      installation[field] = req.body[field];
    }
  }

  installation.updatedAt = nowIso();

  addAuditLog({
    customerId: installation.customerId,
    instanceId: installation.instanceId,
    installationId: installation.id,
    entityType: 'installation',
    entityId: installation.id,
    action: 'updated',
    actor: req.body.actor || 'admin',
    reason: req.body.reason || 'Installation updated',
    oldValue: previous,
    newValue: installation
  });

  return res.json({ ok: true, installation: getInstallationWithRelations(installation) });
});

export default router;
