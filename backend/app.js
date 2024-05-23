const express = require('express');
const adminRouter = require('./apis/admin');
const transactionRouter = require('./apis/transaction');
const connectToDatabase = require('./database');

const app = express();
app.use(express.json());

app.use('/admin', adminRouter);

app.use('/transactions', transactionRouter);

app.listen(8000, () => console.log('Server listening on port 8000'));