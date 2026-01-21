import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/database.js';

export class Room extends Model {}

Room.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    roomNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('available', 'occupied', 'maintenance'), allowNull: false, defaultValue: 'available' }
  },
  { sequelize, modelName: 'Room', tableName: 'rooms', timestamps: true }
);

export default Room;

