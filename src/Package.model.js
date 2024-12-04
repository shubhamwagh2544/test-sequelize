import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbconfig.js";
import User from "./User.model.js";

class Package extends Model {}

Package.init(
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
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "packages",
    timestamps: true,
    underscored: true,
  },
);

export default Package;
