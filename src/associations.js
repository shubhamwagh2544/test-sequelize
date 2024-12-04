import { sequelize } from "./dbconfig.js";
import User from "./User.model.js";
import Package from "./Package.model.js";
import Artifact from "./Artifact.model.js";

// One-to-Many Relationship between User and Package
User.hasMany(Package, { foreignKey: "createdBy" });
Package.hasMany(Artifact, { foreignKey: "packageId" });

// Sync all models
export async function syncModels() {
  await sequelize.sync({ force: true });
  console.log("All models synced successfully.");
}
