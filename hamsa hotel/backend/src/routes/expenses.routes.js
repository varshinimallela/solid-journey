import { Router } from 'express';
import { Expense } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { exportToExcel, exportToPDF } from '../utils/export.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from && to) where.date = { $between: [from, to] };
  const expenses = await Expense.findAll({ where });
  res.json(expenses);
});

router.post('/', authorize(['admin']), async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json(expense);
});

router.put('/:id', authorize(['admin']), async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Not found' });
  await expense.update(req.body);
  res.json(expense);
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
  const expense = await Expense.findByPk(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Not found' });
  await expense.destroy();
  res.status(204).end();
});

router.get('/export/excel', async (_req, res) => {
  const rows = await Expense.findAll({ raw: true });
  const buffer = await exportToExcel(rows, 'Expenses');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');
  res.send(buffer);
});

router.get('/export/pdf', async (_req, res) => {
  const rows = await Expense.findAll({ raw: true });
  const buffer = await exportToPDF(rows, 'Expenses');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.pdf"');
  res.send(buffer);
});

export default router;

