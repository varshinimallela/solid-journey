import { Router } from 'express';
import { Booking, Room } from '../models/index.js';
import { Op } from 'sequelize';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const { source, status, from, to } = req.query;
  const where = {};
  if (source) where.source = source;
  if (status) where.status = status;
  if (from && to) where.checkinDate = { [Op.between]: [from, to] };
  const bookings = await Booking.findAll({ include: [Room], where });
  res.json(bookings);
});

router.post('/', authorize(['admin', 'receptionist']), async (req, res) => {
  const payload = req.body;
  const total = Number(payload.totalAmount || payload.price || 0);
  const advance = Number(payload.advanceAmount || 0);
  const balance = total - advance;
  const booking = await Booking.create({ ...payload, totalAmount: total, advanceAmount: advance, balanceAmount: balance });
  // update room status if needed
  const room = await Room.findByPk(booking.roomId);
  if (room) {
    await room.update({ status: 'occupied' });
  }
  res.status(201).json(booking);
});

router.put('/:id', authorize(['admin', 'receptionist']), async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  const payload = req.body;
  let { totalAmount, advanceAmount } = { totalAmount: booking.totalAmount, advanceAmount: booking.advanceAmount };
  if (payload.totalAmount !== undefined) totalAmount = Number(payload.totalAmount);
  if (payload.advanceAmount !== undefined) advanceAmount = Number(payload.advanceAmount);
  const balanceAmount = Number(totalAmount) - Number(advanceAmount);
  await booking.update({ ...payload, totalAmount, advanceAmount, balanceAmount });
  res.json(booking);
});

router.post('/:id/checkout', authorize(['admin', 'receptionist']), async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  await booking.update({ status: 'checked_out' });
  const room = await Room.findByPk(booking.roomId);
  if (room) await room.update({ status: 'available' });
  res.json(booking);
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Not found' });
  await booking.destroy();
  res.status(204).end();
});

export default router;

