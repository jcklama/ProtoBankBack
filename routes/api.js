// best practice: have separate route for all the API requests
const express = require('express')
const fs = require('fs');
const router = express.Router();
const jwt = require('jsonwebtoken');

// middleware to verify token
function verifyToken(req, res, next) {
    console.log(req.headers.authorization);
    const RSA_PRIVATE_KEY = fs.readFileSync('keys/private.key');
    if (!req.headers.authorization) {
        return status(401).send('Unauthorized request');
    }
    // let token = req.headers.authorization.split(' ')[1];
    let token = req.headers.authorization;
    let payloadVerified = jwt.verify(token, RSA_PRIVATE_KEY);
    if (!payloadVerified) {
        return res.status(401).send('Unauthorized request');
    }
    req.userId = payloadVerified.subject;
    next();
}

router.get('/balances/:id', verifyToken, (req, res) => {
    const id = req.params.id
    const filteredBalance = getBalanceById(id);

    res.status(200).send(filteredBalance);
})

router.get('/', (req, res) => {
    res.send(JSON.stringify('From API route'));
})

router.post('/login', (req, res) => {
    let userData = req.body;
    if (validateEmailAndPassword(userData.username, userData.password)) {
        const userId = getIdUsingUsername(userData.username);
        const RSA_PRIVATE_KEY = fs.readFileSync('keys/private.key');

        // this creates a JWT string - signed replacement for user's auth info (usrname, pw)
        const jwtBearerToken = jwt.sign(userData, RSA_PRIVATE_KEY,
            // {
            //     algorithm: 'RS256',
            //     expiresIn: '1h'
            // }
        )
        res.status(200).send({
            id: userId,
            signed_user: userData,
            token: jwtBearerToken,
            expiresIn: 60
        });

    } else {
        res.status(401).send({ error: "Username/Password combination is incorrect." });
    }
})

const validateEmailAndPassword = (username, password) => {
    let validCreds = false;
    const data = fs.readFileSync('db/users.json', 'utf8');
    if (data) {
        const stream = JSON.parse(data);
        const usersFound = stream.filter(info => {
            if (info.username === username && info.password === password) { return true; }
        })
        if (usersFound.length >= 1) { validCreds = true; }
        return validCreds;
    } else {
        throw Error(err);
    }
}

const getIdUsingUsername = (username) => {
    let id = "";
    const data = fs.readFileSync('db/users.json', 'utf8');
    const jsonData = JSON.parse(data)
    jsonData.forEach(user => {
        if (user.username === username) {
            id = user.user_id
        }
    })
    return id;
}

const getBalanceById = (id) => {
    const balances = fs.readFileSync('db/balances.json', 'utf8');
    const parsedBalances = JSON.parse(balances)
    const filtered = parsedBalances.filter((balance) => {
        if (balance.user_id.toString() === id) { return true; }
    })
    return filtered[0];
}

// this exports the router + all its associated routes
module.exports = router
