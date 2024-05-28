const sql = require("mssql")
require('dotenv').config()

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
  pool:{
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  requestTimeout: 300000, // Request timeout in milliseconds (e.g., 5 minutes)
  connectionTimeout: 300000 // Connection timeout in milliseconds (e.g., 5 minutes)
}

module.exports = { sql, sqlConfig }
