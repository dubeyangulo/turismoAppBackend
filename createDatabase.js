const { Pool } = require('pg');
//libreria para variables de entorno
require('dotenv').config();

// Database connection configuration
const config = {
    user: process.env.usuario,
    host: process.env.host,
    database: "postgres",
    password: process.env.password,
    port: 5432, // default PostgreSQL port
};


// Create a new connection pool
const pool = new Pool(config);

async function createDatabase() {
    try {
        // Check if the database exists
        console.log("creando base de datos: ", process.env.database )
        const result = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', [process.env.database]);
        if (result.rowCount === 0) {
            // Create the database
            await pool.query(`CREATE DATABASE ${process.env.database}`);
            console.log(`Database '${process.env.database}' created successfully.`);
        } else {
            console.log(`Database '${process.env.database}' already exists.`);
        }
    } catch (error) {
        console.error('Error creating database:', error);
    } finally {
        // Close the connection
        pool.end();
    }
}

module.exports = createDatabase;