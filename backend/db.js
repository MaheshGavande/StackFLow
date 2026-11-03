import mysql from 'mysql2/promise';

const url = new URL(process.env.DB_URL);

export const pool = mysql.createPool({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  ssl: {
    ca: process.env.DB_CA_CERT?.replace(/\\n/g, '\n'),
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});