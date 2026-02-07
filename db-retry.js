const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://user:pass@localhost:5432/mydb', {
  dialect: 'postgres',           // or 'mysql', 'mssql', etc.
  logging: console.log,
  
  // Retry options
  retry: {
    max: 5,                      // maximum number of retry attempts
    match: [
      /Deadlock/i,               // retry on deadlocks
      /ETIMEDOUT/i,              // retry on timeout errors
      /ECONNRESET/i,
      /SequelizeConnectionError/i,
      /SequelizeConnectionRefusedError/i,
    ],
    backoffBase: 100,            // initial delay in ms
    backoffExponent: 1.5,        // exponential backoff factor
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});