const {Sequelize} = require('sequelize');
const User = require("./User.model");

const sequelize = new Sequelize({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'postgres',
    dialect: 'postgres'
});

// connect database
async function connectDatabase(){
    try {
        await sequelize.authenticate()
            .then(() => console.log('Connection has been established successfully.'))
            .catch(err => console.error('Unable to connect to the database:', err));
    } catch (error) {
        console.log('error connecting postgres...', error)
    }
}

// create models
async function createModels(){
    try {
        await sequelize.sync({force: true});
        console.log('All models created successfully.');
    } catch (error) {
        console.log('error creating models...', error)
    }
}

connectDatabase().then(() => {})
createModels().then(() => {})

async function createUser() {
    try {
        await User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@gmail.com',
            password: '123456'
        })
    } catch (error) {
        console.log('error creating user...', error)
    }
}

createUser().then(() => {})

module.exports = sequelize;