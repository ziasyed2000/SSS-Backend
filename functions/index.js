/**
 * BACKEND SERVER FOR CAPSTONE PROJECT
 */

const functions = require("firebase-functions");
const express = require("express");
const app = express();
const PORT = 3000;

app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));

app.get('/', (req, res) => {
    res.send('<h1>HELLO WORLD!</h1>')
})
