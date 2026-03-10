import express from 'express';
import { db, findEntitlementByInstallationId, nowIso } from '../data/store.js';
import { addAuditLog } from '../services/auditService.js';

const router = express.Router();

router.get('/:installationId', (req, res) => {
  const entitlement = findEntitlementByInstallationId(req.params.installationId);

  if (!entitlement) {
    return res.status(404).json({ error: 'Entitlement not found' });
  }

  return res.json(entitlement);
});

router.post('/:installationId/override', (req, res) => {
  const installation = db.installations.get(req.params.installationId);
  if (!installation) {
    return res.status(404).json({ error: 'Installation not found' });
  }

  const entitlement = findEntitlementByInstallationId(installation.id);
  if (!entitlement) {
    return res.status(404).json({ error: 'Entitlement not found' });
  }

  const previous = { ...entitlement };
  const nextState = req.body.state || entitlement.state;
  const actor = req.body.actor || 'admin';
  const reason = req.body.reason || 'Manual entitlement override';

  entitlement.state = nextState;
  entitlement.planCode = req.body.planCode || entitlement.planCode;
  entitlement.manualOverride = true;
  entitlement.manualOverrideReason = reason;
  entitlement.overrideActor = actor;
  entitlement.overrideAt = nowIso();

  if ('expiresAt' in req.body) {
    entitlement.expiresAt = req.body.expiresAt;
  }

  if (nextState === 'active' && !entitlement.startsAt) {
    entitlement.startsAt = nowIso();
  }

  if (nextState === 'expired' && !entitlement.expiresAt) {
    entitlement.expiresAt = nowIso();
  }

  entitlement.updatedAt = nowIso();

  addAuditLog({
    customerId: installation.customerId,
    instanceId: installation.instanceId,
    installationId: installation.id,
    entityType: 'entitlement',
    entityId: entitlement.id,
    action: 'override',
    actor,
    reason,
    oldValue: previous,
    newValue: entitlement
  });

  return res.json({ ok: true, entitlement });
});

export default router;
