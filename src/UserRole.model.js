import { DataTypes, Model } from 'sequelize';
import { sequelize } from './dbconfig.js';
import User from './User.model.js';
import Role from './Role.model.js';

class UserRole extends Model {}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      // defaultValue: true
    },
  },
  {
    sequelize,
    tableName: 'user_role',
    timestamps: true,
    underscored: true,
  }
);

export default UserRole;
