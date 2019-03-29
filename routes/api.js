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
    const id = req.params.id;
    const filteredBalance = getBalanceById(id);

    res.status(200).send(filteredBalance);
})

router.post('/registration', (req, res) => {
    const request = req.body;
    const fn = request.basic_info.first_name;
    const ln = request.basic_info.last_name;
    const email = request.basic_info.email_address;

    if (!validateRegistration(fn, ln, email)) {
        addNewUserToUsers(request);
        const addedData = addToRegistration(request);

        const RSA_PRIVATE_KEY = fs.readFileSync('keys/private.key');
        const jwtBearerToken = jwt.sign(addedData, RSA_PRIVATE_KEY);

        const defaultProductsInfo = {
            user_id: getLengthOfRegistered(),
            chequing_balance: 0,
            savings_balance: 0,
            credit_cards: []
        }

        res.status(200).send({
            newly_registered_user: addedData,
            defaultProductsInfo: defaultProductsInfo,
            token: jwtBearerToken,
            expires_in: 180
        });
    } else {
        res.status(400).send({ error: "Attempted to add duplicate or invalid user" });
    }
})

router.get('/registeredUsersInfo', (req, res) => {
    const data = fs.readFileSync('db/registration.json', 'utf8');
    if (data) {
        res.status(200).send(data);
    } else {
        res.status(500).send({ error: "Registered users not found" });
    }
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
        const jwtBearerToken = jwt.sign(userData, RSA_PRIVATE_KEY)
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

const validateRegistration = (fn, ln, email) => {
    const reg = fs.readFileSync('db/registration.json', 'utf8');
    const regObject = JSON.parse(reg);

    const existingUsers = regObject.filter(userInfo => {
        const db_fn = userInfo["basic_info"]["first_name"];
        const db_ln = userInfo["basic_info"]["last_name"];
        const db_email = userInfo["basic_info"]["email_address"];

        if (db_fn === fn && db_ln === ln && db_email === email) { return true; }
    })

    return existingUsers.length > 0 ? true : false;
}

const addToRegistration = (requestData) => {
    let registeredUsers = JSON.parse(fs.readFileSync('db/registration.json', 'utf8'));
    const registeredUsersLength = registeredUsers.length;

    requestData.products = productsToObj(requestData["products"]);
    requestData.user_id = registeredUsersLength + 1;

    registeredUsers.push(requestData);
    const stringifiedUpdatedUsers = JSON.stringify(registeredUsers);
    fs.writeFileSync('db/registration.json', stringifiedUpdatedUsers);

    return requestData;
}

const productsToObj = (arr) => {
    productOptions = [
        'Chequing',
        'Savings',
        'Line of Credit',
        'Mortage',
        'Credit Card'
    ]

    return arr.reduce((accum, curr, i) => {
        curr ? accum[productOptions[i]] = curr : accum[productOptions[i]] = false;
        return accum;
    }, {})
}

const addNewUserToUsers = (requestBody) => {
    const data = JSON.parse(fs.readFileSync('db/users.json', 'utf8'));
    const dataLength = data.length;

    const fn = requestBody.basic_info.first_name;
    const ln = requestBody.basic_info.last_name;

    data.push({
        user_id: (dataLength + 1).toString(),
        username: fn,
        password: ln
    })
    const stringifiedNewData = JSON.stringify(data);

    fs.writeFileSync('db/users.json', stringifiedNewData);
}

const getLengthOfRegistered = () => {
    const data = JSON.parse(fs.readFileSync('db/registration.json', 'utf8'));
    return data.length;
}

// this exports the router + all its associated routes
module.exports = router
