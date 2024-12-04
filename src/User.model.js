import { DataTypes, Model } from 'sequelize';
import { sequelize } from './dbconfig.js';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
