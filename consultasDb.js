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

    createTableInformacionDepartamentos: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS informacion_departamentos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                informacion TEXT
            )`);
            console.log('Table informacion_departamentos created successfully.');
        } catch (error) {
            console.error('Error creating table informacion_departamentos:', error);
        } 
    },

    createTableInformacionCiudades: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS informacion_ciudades (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                id_informacion_departamento INT NOT NULL,
                informacion TEXT,
                imagen varchar(255),
                FOREIGN KEY (id_informacion_departamento) REFERENCES informacion_departamentos(id)
            )`);
            console.log('Table informacion_ciudades created successfully.');
        } catch (error) {
            console.error('Error creating table informacion_ciudades:', error);
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
    },

    insertarInformacionDepartamentoYCiudad: async function () {
        const client = pool;
        try {
            // leer archivo json
            fs.readFile('informacion_ciudades.json', 'utf8', async (err, data) => {
                if (err) {
                    console.error(err);
                    return 'Hubo un error al leer el archivo';
                }
                const lugares = JSON.parse(data);
                for (const lugar of lugares.departamentos) {
                    // Insertar departamento
                    const result = await client.query('SELECT id FROM informacion_departamentos WHERE nombre = $1', [lugar.nombre]);
                    let idDepartamento;
                    if (result.rowCount === 0) {
                        const result = await client.query('INSERT INTO informacion_departamentos (nombre, informacion) VALUES ($1, $2) RETURNING id', [lugar.nombre, lugar.informacion]);
                        idDepartamento = result.rows[0].id;
                    } else {
                        idDepartamento = result.rows[0].id;
                    }

                    // consultar ciudad por nombre y departamento
                    for (const ciudad of lugar.municipios) {
                        const result2 = await client.query('SELECT id FROM informacion_ciudades WHERE nombre = $1 AND id_informacion_departamento = $2', [ciudad.nombre, idDepartamento]);
                        if (result2.rowCount === 0) {
                            // Insertar ciudad
                            await client.query('INSERT INTO informacion_ciudades (nombre, id_informacion_departamento, informacion, imagen) VALUES ($1, $2, $3, $4)', [ciudad.nombre, idDepartamento, ciudad.informacion, ciudad.imagen]);
                        }
                    }
                }
                console.log('Data inserted successfully.');
            });
        } catch (error) {
            console.error('Error inserting data:', error);
            return 'Hubo un error al insertar la información';
        }
    },

    //consultar informacion de departamento y ciudad
    consultarInformacionDepartamentoCiudad: async function (departamento, ciudad) {
        const client = pool;
        try {
            const result = await client.query('SELECT id FROM informacion_departamentos WHERE nombre = $1', [departamento]);
            if (result.rowCount === 0) {
                return [];
            }
            const idDepartamento = result.rows[0].id;
            //obtener informacion del departamento y ciudad
            const result2 = await client.query('SELECT i.nombre AS departamento, i.informacion AS informacion_departamento, c.nombre AS ciudad, c.informacion AS informacion_ciudad, c.imagen AS imagen_ciudad FROM informacion_departamentos i JOIN informacion_ciudades c ON i.id = c.id_informacion_departamento WHERE i.id = $1 AND c.nombre = $2', [idDepartamento, ciudad]);
            return result2.rows;
        } catch (error) {
            console.error('Error querying data:', error);
            return [];
        }
    }
};




