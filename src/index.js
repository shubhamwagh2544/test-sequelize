import express from 'express';
import cors from 'cors';
import User from "./User.model.js";
import {setUpDatabase} from "./dbconfig.js";

const app = express();

app.use(express.json());
app.use(cors());

setUpDatabase()
    .then(() => console.log('database setup successful'))
    .catch(error => console.error('database setup failed', error));

app.post('/api/user', async (req, res) => {
    const {firstname, lastname, email, password} = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }
    const user = await User.create({firstname, lastname, email, password});
    return res.status(201).json(user);
});

app.listen(
    3000,
    () => console.log('server started on 3000')
);
