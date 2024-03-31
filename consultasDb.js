const pool = require('./conexion');
const fs = require('fs');


module.exports = {
   
    createTableDepartamentos: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS departamentos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL
            )`);
            console.log('Table departamentos created successfully.');
        } catch (error) {
            console.error('Error creating table departamentos:', error);
        } 
    },

    createTableCiudades: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS ciudades (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                id_departamento INT NOT NULL,
                FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
            )`);
            console.log('Table ciudades created successfully.');
        } catch (error) {
            console.error('Error creating table ciudades:', error);
        } 
    },

    // leer archivo json, obtener departamentos y ciudades, si no estan en la base de datos se insertan
    insertarDepartamentosYCiudades: async function () {
        fs.readFile('lugares.json', 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const lugares = JSON.parse(data);
            const client = pool;
            try {
                for (const lugar of lugares.departamentos) {
                    // Insertar departamento
                    const result = await client.query('SELECT id FROM departamentos WHERE nombre = $1', [lugar.nombre]);
                    let idDepartamento;
                    if (result.rowCount === 0) {
                        const result = await client.query('INSERT INTO departamentos (nombre) VALUES ($1) RETURNING id', [lugar.nombre]);
                        idDepartamento = result.rows[0].id;
                    } else {
                        idDepartamento = result.rows[0].id;
                    }

                    // consultar ciudad por nombre y departamento
                    for (const ciudad of lugar.ciudades) {
                        const result2 = await client.query('SELECT id FROM ciudades WHERE nombre = $1 AND id_departamento = $2', [ciudad, idDepartamento]);
                        if (result2.rowCount === 0) {
                            // Insertar ciudad
                            await client.query('INSERT INTO ciudades (nombre, id_departamento) VALUES ($1, $2)', [ciudad, idDepartamento]);
                        }
                    }
                }
                console.log('Data inserted successfully.');
            } catch (error) {
                console.error('Error inserting data:', error);
            } 
        });
    },

    // consultar departamento y ciudad por nombre
    consultarDepartamentoCiudad: async function (departamento, ciudad) {
        const client = pool;
        try {
            const result = await client.query('SELECT d.nombre AS departamento, c.nombre AS ciudad FROM departamentos d JOIN ciudades c ON d.id = c.id_departamento WHERE d.nombre = $1 AND c.nombre = $2', [departamento, ciudad]);
            return result.rows;
        } catch (error) {
            console.error('Error querying data:', error);
            return [];
        } 
    }
};




