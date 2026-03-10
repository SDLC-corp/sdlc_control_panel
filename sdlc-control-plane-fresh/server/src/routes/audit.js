import express from 'express';
import { db } from '../data/store.js';

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = [...db.auditLogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ auditLogs: rows });
});

export default router;
