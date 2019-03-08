// best practice: have separate route for all the API requests
const express = require('express')
const fs = require('fs');
const router = express.Router();


router.get('/', (req, res) => {
    res.send(JSON.stringify('From API route'));
})

router.post('/login', (req, res) => {
    let userData = req.body
    console.log('req body: ' + JSON.stringify(userData));
    res.send(userData);
    // check if userID is same as one in DB
    // if error, clog it else
    // if no user found, send error of 401 saying no user found
    // if user found, check  password
    // if not password, send error of 401 saying no password found
    // else send user details with status of 200
})

// this exports the router + all its associated routes
module.exports = router