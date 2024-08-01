require('dotenv').config();
const mysql = require('mysql2/promise');

async function connectToDatabase() {
    const pool = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD,
      database: 'mockstock',
      //host: 'us-cluster-east-01.k8s.cleardb.net',
      //user: 'b241afea94cd06',
      //password: "d6052a4d",
      //database: 'heroku_90a8077a7061fb0',
    });
    try {
      
      await pool.getConnection();
      console.log('Connected to database successfully!');
  } catch (error) {
      console.error('Database connection error:', error);
  }
    return pool;
  } 

module.exports = connectToDatabase;

//mysql://b241afea94cd06:d6052a4d@us-cluster-east-01.k8s.cleardb.net/heroku_90a8077a7061fb0?reconnect=true 