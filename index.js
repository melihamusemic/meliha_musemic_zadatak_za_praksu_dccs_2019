//this file represents the server side of application

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.use("/public", express.static(__dirname + "/public"));

app.get('/', (request, response) => {
    response.redirect('zadatak.html');
})

app.get('/zadatak.css', (request, response) => {
    response.redirect('zadatak.css');
})

app.get('/zadatak.js', (request, response) => {
    response.redirect('zadatak.js');
})

app.get('/background.jpg', (request, response) => {
    response.redirect('background.jpg');
})

app.get('/all', db.getAll);
app.get('/rbuttons', db.getRButtons);
app.get('/createFormular', db.createFormular);
app.get('/getFormularNames', db.getFormularNames);
app.get('/getFilledFormular', db.getFilledFormular);
app.get('/fillFormular', db.fillFormular);

app.listen(port, () => {
    console.log("App running");
})