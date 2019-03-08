const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/api');

const app = express();
const port = process.env.port || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// whenever request is made to localhost:3000/api, server knows to use api route defined in the 'api.js' file
// Express knows it's a router because we've defined it as such (router = express.Router())
// tell server to use this route
// i.e. app.use('/api', api) tells to route get, post, etc. calls in the api.js file when the call is appended with .../api..
app.use('/api', api)


app.get('/', function (req, res) {
    res.send(JSON.stringify('Hello from server'));
})

app.post('/login', (req, res) => {
    let userData = req.body
    res.send('Request body: ' + JSON.stringify(userData));
})





app.listen(port, function () {
    console.log('Server running on localhost: ' + port);
});