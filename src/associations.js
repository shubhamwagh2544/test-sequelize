import User from './User.model.js';
import Role from './Role.model.js';
import { sequelize } from './dbconfig.js';
import UserRole from './UserRole.model.js';
import Post from './Post.model.js';
import Profile from './Profile.model.js';

// Many-to-Many Relationship between User and Role
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });

// One-to-Many Relationship between User and Post
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

// One-to-One Relationship between User and Profile
User.hasOne(Profile, { foreignKey: 'userId' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// Sync all models
export async function syncModels() {
  await sequelize.sync({ force: true });
  console.log('All models synced successfully.');
}
