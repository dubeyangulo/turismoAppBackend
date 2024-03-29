const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;


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

app.listen(port, () => {
  console.log(`La aplicación está escuchando en http://localhost:${port}`);
});