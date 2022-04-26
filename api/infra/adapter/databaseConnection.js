const mysql = require('mysql2');

class DatabaseConnection {
  pool;

  constructor() {
    const mysqlPool = mysql.createPool({
      connectionLimit: 1,
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DATABASE,
    });

    this.pool = mysqlPool.promise();
  }

  async query(statement, params) {
    return this.pool.query(statement, params);
  }
}

module.exports = DatabaseConnection;
