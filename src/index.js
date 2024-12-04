import express from 'express';
import cors from 'cors';
import multer from 'multer';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';

import { connectDatabase, sequelize } from './dbconfig.js';
import { syncModels } from './associations.js';

const app = express();
const storage = multer.memoryStorage();

async function setUpDatabase() {
  await connectDatabase();
  await syncModels();
}

// set up the database
setUpDatabase()
  .then(() => {
    console.log('Database setup complete');
  })
  .catch((error) => {
    console.error('Error setting up the database:', error);
  });

// multer middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
}).single('file');

app.use(express.json());
app.use(cors());

// create user
app.post('/api/user', (req, res) => {});

// create package
app.post('/api/package', (req, res) => {});

// upload artifact for a package
app.post('/api/package/:id/artifacts', (req, res) => {});

// download artifact for a package
app.get('/api/package/:id/artifacts/:artifactId', (req, res) => {});

// download bulk artifacts for a package
app.post('/api/package/:id/artifacts/download', (req, res) => {});

// server listening
app.listen(3000, () => console.log('server started on 3000'));
