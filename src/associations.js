import User from './User.model.js';
import Role from './Role.model.js';
import { sequelize } from './dbconfig.js';
import UserRole from './UserRole.model.js';

// Many-to-Many Relationship between User and Role
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });

// Sync all models
export async function syncModels() {
  await sequelize.sync({ force: true });
  console.log('All models synced successfully.');
}
