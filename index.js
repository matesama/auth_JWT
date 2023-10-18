import express from 'express';
import 'dotenv/config';
import client from './db/db.js';
import loginRouter from './router/login.js';

const app = express();
app.use(express.json());

app.use('/', loginRouter);


const port = process.env.PORT || 3001;
client.on('connected', () => {
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
})
