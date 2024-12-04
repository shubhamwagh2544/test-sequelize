import { DataTypes, Model } from "sequelize";
import { sequelize } from "./dbconfig.js";
import User from "./User.model.js";
import Package from "./Package.model.js";

class Artifact extends Model {}

Artifact.init(
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
    attachment: {
      type: DataTypes.BLOB,
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
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      reference: {
        model: Package,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "artifacts",
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ["attachment"],
      },
    },
  },
);

export default Artifact;
