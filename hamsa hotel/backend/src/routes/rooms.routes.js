import { Router } from 'express';
import { Room } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { exportToExcel, exportToPDF } from '../utils/export.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;
  const rooms = await Room.findAll({ where });
  res.json(rooms);
});

router.post('/', authorize(['admin']), async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json(room);
});

router.put('/:id', authorize(['admin']), async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Not found' });
  await room.update(req.body);
  res.json(room);
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Not found' });
  await room.destroy();
  res.status(204).end();
});

router.get('/export/excel', async (_req, res) => {
  const rows = await Room.findAll({ raw: true });
  const buffer = await exportToExcel(rows, 'Rooms');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="rooms.xlsx"');
  res.send(buffer);
});

router.get('/export/pdf', async (_req, res) => {
  const rows = await Room.findAll({ raw: true });
  const buffer = await exportToPDF(rows, 'Rooms');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="rooms.pdf"');
  res.send(buffer);
});

export default router;

