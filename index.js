import express from 'express';
import 'dotenv/config';
import client from './db/db.js';
import authRouter from './router/auth.js';

const app = express();
app.use(express.json());

app.use('/', authRouter);


const port = process.env.PORT || 3001;
client.on('connected', () => {
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
})
