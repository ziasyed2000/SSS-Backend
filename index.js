/**
 * BACKEND SERVER FOR CAPSTONE PROJECT
 * 
 * FOR DEVELOPMENT - USE "npm run start:dev"
 */

const dotnev = require("dotenv");
dotnev.config();
const express = require("express");

const app = express();

const PORT = process.env.LOCALHOST || 5000;

app.get('/', (req, res) => {
    res.send('<h1>HELLO WORLD!</h1>')
})

app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));