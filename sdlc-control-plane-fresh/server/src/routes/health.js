import express from 'express';
import { getInstallationsWithRelations } from '../data/store.js';

const router = express.Router();

router.get('/exceptions', (_req, res) => {
  const exceptions = getInstallationsWithRelations().filter((installation) => {
    const badHeartbeat =
      installation.heartbeatStatus === 'late' || installation.heartbeatStatus === 'offline';
    const failing = (installation.failureStreak || 0) > 0;
    const needsAttention = Boolean(
      installation.needsAttention || installation.manualAttentionNeeded
    );

    return badHeartbeat || failing || needsAttention;
  });

  res.json({ exceptions });
});

export default router;
