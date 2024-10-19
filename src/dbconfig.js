import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'postgres',
  dialect: 'postgres',
  logging: console.log,
});

// Test the connection
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
