const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.port || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // this line is needed to ALLOW for ALL types of headers in the preflight request (e.g. content-type, accept, etc.)
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Custom-Header');
    next();
})
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// whenever request is made to localhost:3000/api, server knows to use api route defined in the 'api.js' file
// Express knows it's a router because we've defined it as such (router = express.Router())
// tell server to use this route
// i.e. app.use('/api', api) tells to route get, post, etc. calls in the api.js file when the call is appended with .../api..
const api = require('./routes/api');
app.use('/api', api)


app.get('/', function (req, res) {
    res.send(JSON.stringify('Hello from server'));
})

app.post('/login', (req, res) => {
    let userData = req.body
    console.log(userData);
    console.log(typeof userData);
    res.send(userData); // automatically sends response back with 'Content-Type' header of json
})

app.listen(port, function () {
    console.log('Server running on localhost: ' + port);
});


// const jwksRsa = require('jwks-rsa');
// const expressJwt = require('express-jwt');

// // this PUBLIC key can only be used to validate existing JWTs, not create new ones
// const RSA_PUBLIC_KEY = fs.readFileSync('./keys/private.key');

// // use express-jwt to quickly create middleware that will check for authenticated requests 
// // middleware will throw error if incorrectly signed JWT not present / has expired
// const checkIfAuthenticated = expressJwt({
//     secret: RSA_PUBLIC_KEY
// })

// app.route('/api/balances')
//     .get(checkIfAuthenticated)

// publish JWT-validating public key in a publicly accessible Url -> key rotation & revocation
// Use JWKS (JSON Web Key Set) - standard for publishing public keys in a REST endpoint

