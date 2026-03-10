import express from 'express';
import { db, createId, nowIso } from '../data/store.js';
import { addAuditLog } from '../services/auditService.js';

const router = express.Router();

router.get('/notes', (_req, res) => {
  const notes = Array.from(db.supportNotes.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ notes });
});

router.post('/notes', (req, res) => {
  if (!req.body.body) {
    return res.status(400).json({ error: 'body is required' });
  }

  const note = {
    id: createId(),
    customerId: req.body.customerId || null,
    instanceId: req.body.instanceId || null,
    installationId: req.body.installationId || null,
    author: req.body.author || 'admin',
    noteType: req.body.noteType || 'internal',
    body: req.body.body,
    isPinned: Boolean(req.body.isPinned),
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  db.supportNotes.set(note.id, note);

  addAuditLog({
    customerId: note.customerId,
    instanceId: note.instanceId,
    installationId: note.installationId,
    entityType: 'support_note',
    entityId: note.id,
    action: 'created',
    actor: note.author,
    newValue: note
  });

  return res.status(201).json({ ok: true, note });
});

export default router;
