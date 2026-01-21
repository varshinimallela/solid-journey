import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../lib/database.js';

export class Expense extends Model {}

Expense.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    description: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    date: { type: DataTypes.DATEONLY, allowNull: false }
  },
  { sequelize, modelName: 'Expense', tableName: 'expenses', timestamps: true }
);

export default Expense;

