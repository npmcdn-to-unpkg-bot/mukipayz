// Update with your config settings.
'use strict';
require('dotenv').config();
  module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/mukipayz',
    pool: {
        min: 1,
        max: 10
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: 'migrations'
    }
  }

};
