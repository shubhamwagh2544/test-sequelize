import express from 'express';
import cors from 'cors';
import multer from 'multer';
import _ from 'lodash';
import path from 'path';
import User from "./User.model.js";
import {setUpDatabase} from "./dbconfig.js";

const app = express();
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|docx|webp/;
        const mimetypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd', 'image/webp'];
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = _.includes(mimetypes, file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents (jpeg, jpg, png, pdf, docx) are allowed!'));
        }
    }
})

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

app.post('/api/user/:id/profile/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (_.isNil(file)) {
        return res.status(400).json({message: 'File is required'});
    }
    // check if user exists
    const id = req.params.id;
    if (_.isNil(id)) {
        return res.status(400).json({message: 'User id is required'});
    }
    let user = await User.findByPk(id);
    if (_.isNil(user)) {
        return res.status(404).json({message: 'User not found'});
    }

    // user found
    user.profile = file.buffer;
    await user.save();

    // return user without profile buffer
    user = await User.findByPk(id, {
        attributes: {
            exclude: ['profile']
        }
    });
    return res.status(200).json({message: 'Profile uploaded successfully', user});
})

app.listen(
    3000,
    () => console.log('server started on 3000')
);
