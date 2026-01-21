import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/rooms.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import reportRoutes from './routes/reports.routes.js';
import banquetRoutes from './routes/banquet.routes.js';
import dailySheetRoutes from './routes/dailysheet.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/banquet', banquetRoutes);
app.use('/api/daily-sheet', dailySheetRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;

