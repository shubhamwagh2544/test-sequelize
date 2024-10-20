import { DataTypes, Model } from 'sequelize';
import { sequelize } from './dbconfig.js';
import User from './User.model.js';

class Profile extends Model {}

// TODO: move profile image to this model
Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    timestamps: true,
    underscored: true,
  }
);

export default Profile;
