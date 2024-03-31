const { Pool } = require('pg');
//libreria para variables de entorno
require('dotenv').config();

// Database connection configuration
const config = {
    user: process.env.usuario,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: 5432, // default PostgreSQL port
};


// Create a new connection pool
const pool = new Pool(config);


module.exports = pool;

