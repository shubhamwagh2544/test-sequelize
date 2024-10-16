import {Sequelize} from "sequelize";

const sequelize = new Sequelize({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'postgres',
    dialect: 'postgres'
});

// connect database and sync models
async function setUpDatabase() {
    await sequelize.authenticate()
    await sequelize.sync({force: false});
}

export {
    sequelize,
    setUpDatabase
}