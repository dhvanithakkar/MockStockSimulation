require('dotenv').config();
const mysql = require('mysql2/promise');

async function connectToDatabase() {
    const pool = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD,
      database: 'mockstock',
    });
    console.log('Connected to database successfully!');
    return pool;
  } 

module.exports = connectToDatabase;

