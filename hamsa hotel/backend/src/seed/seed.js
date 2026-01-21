import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { sequelize } from '../lib/database.js';
import { User, Room, Booking, Expense, BanquetHall } from '../models/index.js';

async function run() {
  try {
    await sequelize.sync({ force: true });

    const adminPass = await bcrypt.hash('admin123', 10);
    const recepPass = await bcrypt.hash('recep123', 10);
    await User.bulkCreate([
      { name: 'Admin User', email: 'admin@example.com', password: adminPass, role: 'admin' },
      { name: 'Front Desk', email: 'reception@example.com', password: recepPass, role: 'receptionist' }
    ]);

    const rooms = await Room.bulkCreate([
      { roomNumber: '101', type: 'Deluxe', rate: 2500, status: 'available' },
      { roomNumber: '102', type: 'Deluxe', rate: 2500, status: 'available' },
      { roomNumber: '201', type: 'Suite', rate: 4500, status: 'available' }
    ], { returning: true });

    await Booking.bulkCreate([
      { guestName: 'John Doe', source: 'WALKIN', checkinDate: '2025-09-20', checkoutDate: '2025-09-22', status: 'checked_out', totalAmount: 5000, advanceAmount: 2000, balanceAmount: 3000, paymentMethod: 'cash', roomId: rooms[0].id },
      { guestName: 'Jane Smith', source: 'OYO', checkinDate: '2025-09-21', checkoutDate: '2025-09-24', status: 'checked_in', totalAmount: 7500, advanceAmount: 3000, balanceAmount: 4500, paymentMethod: 'card', roomId: rooms[2].id }
    ]);

    await BanquetHall.bulkCreate([
      { eventName: 'Wedding', clientName: 'Ravi Kumar', date: '2025-09-23', capacity: 200, rentAmount: 30000, advanceAmount: 10000, balanceAmount: 20000, paymentMethod: 'upi', status: 'booked' },
      { eventName: 'Conference', clientName: 'ACME Corp', date: '2025-09-22', capacity: 80, rentAmount: 15000, advanceAmount: 5000, balanceAmount: 10000, paymentMethod: 'bank', status: 'completed' }
    ]);

    await Expense.bulkCreate([
      { description: 'Laundry', amount: 800, date: '2025-09-21' },
      { description: 'Electricity', amount: 3200, date: '2025-09-20' }
    ]);

    console.log('Seed completed');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed', e);
    process.exit(1);
  }
}

run();

