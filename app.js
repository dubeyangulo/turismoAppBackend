const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;
const createDatabase = require('./createDatabase');
const consultasDb = require('./consultasDb');



app.use(cors());

app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});

app.get('/lugares', (req, res) => {
    fs.readFile('lugares.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Hubo un error al leer el archivo');
        }
        res.json(JSON.parse(data));
    });
});

//consultamos informacion de un departamento y ciudad en especifico
app.get('/informacion/:departamento/:ciudad', (req, res) => {
    //consultamos si el departemento y ciudad existe en la base de datos
    consultasDb.consultarDepartamentoCiudad(req.params.departamento, req.params.ciudad)
        .then((result) => {
            if (result.length === 0) {
                res.status(404).send('No se encontró la información solicitada');
            } else {
                res.json(result);
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Hubo un error al consultar la base de datos');
        });
});

(async () => {
    try{
        console.log("creacion de tablas y registros en la base de datos");
        await createDatabase();
        await consultasDb.createTableDepartamentos();
        await consultasDb.createTableCiudades();
        await consultasDb.insertarDepartamentosYCiudades();
        app.listen(port, () => {
            console.log(`La aplicación está escuchando en http://localhost:${port}`);
        });
    }
    catch(error){
        console.error(error);
    }
})();
