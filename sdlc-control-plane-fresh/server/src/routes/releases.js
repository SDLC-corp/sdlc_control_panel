import express from 'express';
import { getInstallationsWithRelations } from '../data/store.js';

const router = express.Router();

router.get('/summary', (_req, res) => {
  const rows = getInstallationsWithRelations();

  const summary = {
    total: rows.length,
    upgradeNeeded: rows.filter((row) => row.upgradeNeeded).length,
    migrationRequired: rows.filter((row) => row.migrationRequired).length,
    securityPatchRequired: rows.filter((row) => row.securityPatchRequired).length,
    incompatible: rows.filter((row) => row.compatibilityStatus === 'incompatible').length,
    beta: rows.filter((row) => row.releaseChannel === 'beta').length
  };

  const items = rows.map((row) => ({
    installationId: row.id,
    productCode: row.product?.code || null,
    productName: row.product?.name || null,
    customerName: row.customer?.name || null,
    installedVersion: row.installedVersion,
    latestAvailableVersion: row.latestAvailableVersion,
    odooVersion: row.odooVersion,
    releaseChannel: row.releaseChannel,
    upgradeNeeded: row.upgradeNeeded,
    upgradePriority: row.upgradePriority,
    migrationRequired: row.migrationRequired,
    securityPatchRequired: row.securityPatchRequired,
    compatibilityStatus: row.compatibilityStatus
  }));

  res.json({ summary, items });
});

export default router;
