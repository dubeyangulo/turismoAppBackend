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

    createTableComidasTipicas: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS comidas_tipicas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                descripcion TEXT,
                imagen varchar(255),
                precio_en_pesos DECIMAL(10, 2),
                precio_en_dolares DECIMAL(10, 2),
                precio_en_euros DECIMAL(10, 2),
                id_informacion_ciudades INT NOT NULL,
                FOREIGN KEY (id_informacion_ciudades) REFERENCES informacion_ciudades(id)
            )`);
            console.log('Table comidas_tipicas created successfully.');
        } catch (error) {
            console.error('Error creating table comidas_tipicas:', error);
        }
    },

    createTableSitiosTuristicos: async function () {
        const client = pool;
        try {
            await client.query(`CREATE TABLE IF NOT EXISTS sitios_turisticos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                descripcion TEXT,
                imagen varchar(255),
                precio_en_pesos DECIMAL(10, 2),
                precio_en_dolares DECIMAL(10, 2),
                precio_en_euros DECIMAL(10, 2),
                id_informacion_ciudades INT NOT NULL,
                FOREIGN KEY (id_informacion_ciudades) REFERENCES informacion_ciudades(id)
            )`);
            console.log('Table sitios_turisticos created successfully.');
        } catch (error) {
            console.error('Error creating table sitios_turisticos:', error);
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
                            const result2 = await client.query('INSERT INTO informacion_ciudades (nombre, id_informacion_departamento, informacion, imagen) VALUES ($1, $2, $3, $4) RETURNING id', [ciudad.nombre, idDepartamento, ciudad.informacion, ciudad.imagen]);
                            
                            idInformacionCiudades = result2.rows[0].id;
                        } else {
                            idInformacionCiudades = result2.rows[0].id;
                        }

                        // consultar comidas tipicas por ciudad
                        for (const comida of ciudad.comidas_tipicas) {
                            const result4 = await client.query('SELECT id FROM comidas_tipicas WHERE nombre = $1 AND id_informacion_ciudades = $2', [comida.nombre, idInformacionCiudades]);
                            if (result4.rowCount === 0) {
                                // Insertar comida tipica
                                await client.query('INSERT INTO comidas_tipicas (nombre, descripcion, imagen, precio_en_pesos, precio_en_dolares, precio_en_euros, id_informacion_ciudades) VALUES ($1, $2, $3, $4, $5, $6, $7)', [comida.nombre, comida.descripcion, comida.imagen, comida.precio_en_pesos, comida.precio_en_dolares, comida.precio_en_euros, idInformacionCiudades]);
                            }
                        }
                        // consultar sitios turisticos por ciudad
                        for (const sitio of ciudad.sitios_turisticos) {
                            const result5 = await client.query('SELECT id FROM sitios_turisticos WHERE nombre = $1 AND id_informacion_ciudades = $2', [sitio.nombre, idInformacionCiudades]);
                            if (result5.rowCount === 0) {
                                // Insertar sitio turistico
                                await client.query('INSERT INTO sitios_turisticos (nombre, descripcion, imagen, precio_en_pesos, precio_en_dolares, precio_en_euros, id_informacion_ciudades) VALUES ($1, $2, $3, $4, $5, $6, $7)', [sitio.nombre, sitio.descripcion, sitio.imagen, sitio.precio_en_pesos, sitio.precio_en_dolares, sitio.precio_en_euros, idInformacionCiudades]);
                            }
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
    },

    //consultar informacion comidas tipicas
    consultarComidasTipicas: async function (departamento, ciudad) {
        const client = pool;
        try {
            const result = await client.query('SELECT i.nombre AS departamento, c.nombre AS ciudad, ct.nombre AS comida_tipica, ct.descripcion, ct.imagen, ct.precio_en_pesos, ct.precio_en_dolares, ct.precio_en_euros FROM informacion_departamentos i JOIN informacion_ciudades c ON i.id = c.id_informacion_departamento JOIN comidas_tipicas ct ON c.id = ct.id_informacion_ciudades WHERE i.nombre = $1 AND c.nombre = $2', [departamento, ciudad]);
            return result.rows;
        } catch (error) {
            console.error('Error querying data:', error);
            return [];
        }
    },

    //consultar informacion sitios turisticos
    consultarSitiosTuristicos: async function (departamento, ciudad) {
        const client = pool;
        try {
            const result = await client.query('SELECT i.nombre AS departamento, c.nombre AS ciudad, st.nombre AS sitio_turistico, st.descripcion, st.imagen, st.precio_en_pesos, st.precio_en_dolares, st.precio_en_euros FROM informacion_departamentos i JOIN informacion_ciudades c ON i.id = c.id_informacion_departamento JOIN sitios_turisticos st ON c.id = st.id_informacion_ciudades WHERE i.nombre = $1 AND c.nombre = $2', [departamento, ciudad]);
            return result.rows;
        } catch (error) {
            console.error('Error querying data:', error);
            return [];
        }
    },
};




