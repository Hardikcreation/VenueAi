const mysql = require('mysql2');
require('dotenv').config();

let promisePool = null;

const getPool = () => {
  if (!promisePool) {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    promisePool = pool.promise();
  }
  return promisePool;
};

module.exports = { getPool };
