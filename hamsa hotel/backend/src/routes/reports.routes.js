import { Router } from 'express';
import { sequelize } from '../lib/database.js';
import { Booking, Room, Expense, BanquetHall } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { exportToExcel, exportToPDF } from '../utils/export.js';

const router = Router();

router.use(authenticate);

router.get('/summary', async (_req, res) => {
  const totalRooms = await Room.count();
  const occupiedRooms = await Room.count({ where: { status: 'occupied' } });
  const occupancy = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const [incomeResult] = await sequelize.query("SELECT COALESCE(SUM(totalAmount),0) AS income FROM bookings WHERE status IN ('booked','checked_in','checked_out')");
  const [banquetIncomeResult] = await sequelize.query("SELECT COALESCE(SUM(rentAmount),0) AS income FROM banquet_hall WHERE status IN ('booked','completed')");
  const income = Number(incomeResult[0]?.income || 0) + Number(banquetIncomeResult[0]?.income || 0);

  const [expenseResult] = await sequelize.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses');
  const expenses = Number(expenseResult[0]?.expenses || 0);

  const profit = income - expenses;

  const pendingCheckouts = await Booking.count({ where: { status: 'checked_in' } });

  // today KPIs
  const [todayRevenueResult] = await sequelize.query("SELECT COALESCE(SUM(totalAmount),0) AS dayIncome FROM bookings WHERE checkinDate = CURDATE()");
  const [todayBanquetRevenueResult] = await sequelize.query("SELECT COALESCE(SUM(rentAmount),0) AS dayIncome FROM banquet_hall WHERE date = CURDATE()");
  const [todayExpensesResult] = await sequelize.query("SELECT COALESCE(SUM(amount),0) AS dayExpenses FROM expenses WHERE date = CURDATE()");
  const todaysRevenue = Number(todayRevenueResult[0]?.dayIncome || 0) + Number(todayBanquetRevenueResult[0]?.dayIncome || 0);
  const todaysProfit = todaysRevenue - Number(todayExpensesResult[0]?.dayExpenses || 0);

  // source breakdown & payment methods
  const [sourceRows] = await sequelize.query("SELECT source, COUNT(*) cnt FROM bookings GROUP BY source");
  const [paymentRows] = await sequelize.query("SELECT paymentMethod, COUNT(*) cnt FROM bookings GROUP BY paymentMethod");

  res.json({ totalRooms, occupiedRooms, occupancy, income, expenses, profit, pendingCheckouts, todaysRevenue, todaysProfit, sourceBreakdown: sourceRows, paymentBreakdown: paymentRows });
});

router.get('/export/excel', async (_req, res) => {
  const bookings = await Booking.findAll({ include: [Room], raw: true, nest: true });
  const buffer = await exportToExcel(bookings, 'Bookings');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.xlsx"');
  res.send(buffer);
});

router.get('/export/pdf', async (_req, res) => {
  const expenses = await Expense.findAll({ raw: true });
  const buffer = await exportToPDF(expenses, 'Expenses Report');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.pdf"');
  res.send(buffer);
});

router.get('/summary/export/excel', async (_req, res) => {
  const [summary] = await Promise.all([
    (async () => {
      const totalRooms = await Room.count();
      const occupiedRooms = await Room.count({ where: { status: 'occupied' } });
      const [incomeResult] = await sequelize.query("SELECT COALESCE(SUM(totalAmount),0) AS income FROM bookings WHERE status IN ('booked','checked_in','checked_out')");
      const [banquetIncomeResult] = await sequelize.query("SELECT COALESCE(SUM(rentAmount),0) AS income FROM banquet_hall WHERE status IN ('booked','completed')");
      const [expenseResult] = await sequelize.query('SELECT COALESCE(SUM(amount),0) AS expenses FROM expenses');
      const income = Number(incomeResult[0]?.income || 0) + Number(banquetIncomeResult[0]?.income || 0);
      const expenses = Number(expenseResult[0]?.expenses || 0);
      const profit = income - expenses;
      const occupancy = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      return { totalRooms, occupiedRooms, occupancy, income, expenses, profit };
    })()
  ]);
  const buffer = await exportToExcel([summary], 'Summary');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="summary.xlsx"');
  res.send(buffer);
});

router.get('/summary/export/pdf', async (_req, res) => {
  const [row] = await sequelize.query(`SELECT
    (SELECT COUNT(*) FROM rooms) AS totalRooms,
    (SELECT COUNT(*) FROM rooms WHERE status='occupied') AS occupiedRooms,
    (SELECT COALESCE(SUM(totalAmount),0) FROM bookings WHERE status IN ('booked','checked_in','checked_out')) + (SELECT COALESCE(SUM(rentAmount),0) FROM banquet_hall WHERE status IN ('booked','completed')) AS income,
    (SELECT COALESCE(SUM(amount),0) FROM expenses) AS expenses`);
  const data = row[0];
  const occupancy = data.totalRooms ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0;
  const profit = Number(data.income) - Number(data.expenses);
  const buffer = await exportToPDF([{ ...data, occupancy, profit }], 'Dashboard Summary');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="summary.pdf"');
  res.send(buffer);
});

router.get('/trends/revenue', async (_req, res) => {
  const [rows] = await sequelize.query(`
    SELECT d AS date,
      COALESCE((SELECT SUM(totalAmount) FROM bookings WHERE checkinDate = d),0) +
      COALESCE((SELECT SUM(rentAmount) FROM banquet_hall WHERE date = d),0) AS revenue
    FROM (
      SELECT CURDATE() - INTERVAL seq DAY AS d
      FROM (
        SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13
      ) AS seqs
    ) AS days
    ORDER BY date ASC;
  `);
  res.json(rows);
});

export default router;

