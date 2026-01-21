import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/database.js';
import Room from './Room.js';

export class Booking extends Model {}

Booking.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    guestName: { type: DataTypes.STRING, allowNull: false },
    source: { type: DataTypes.ENUM('WALKIN','ARTIST','REFERENCE','OYO','CO-LIVING','INDIAN IDOL','ZEE'), allowNull: false, defaultValue: 'WALKIN' },
    checkinDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkoutDate: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('booked', 'checked_in', 'checked_out', 'cancelled'), allowNull: false, defaultValue: 'booked' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    advanceAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    balanceAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    paymentMethod: { type: DataTypes.ENUM('cash','card','upi','bank'), allowNull: false, defaultValue: 'cash' },
  },
  { sequelize, modelName: 'Booking', tableName: 'bookings', timestamps: true }
);

Room.hasMany(Booking, { foreignKey: { name: 'roomId', allowNull: false }, onDelete: 'RESTRICT' });
Booking.belongsTo(Room, { foreignKey: { name: 'roomId', allowNull: false } });

export default Booking;

