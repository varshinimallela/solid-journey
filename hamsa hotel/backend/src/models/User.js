import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/database.js';

export class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'receptionist'), allowNull: false, defaultValue: 'receptionist' }
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

export default User;

