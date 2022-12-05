/**
 * BACKEND SERVER FOR CAPSTONE PROJECT
 */

//Imports
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
const firebase = require("firebase");
require("firebase/firestore");

//Firebase setup
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API,
    authDomain: "sss-capstone.firebaseapp.com",
    projectId: "sss-capstone",
    storageBucket: "sss-capstone.appspot.com",
    messagingSenderId: "318786886535",
    appId: "1:318786886535:web:821c3610e25f2a1a329122"
};

firebase.initializeApp(firebaseConfig);

//Reference to the firestore database
const db = firebase.firestore();

//Initializing express
const app = express();
const PORT = process.env.PORT || 3000;

//Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//Parse application/json
app.use(bodyParser.json());
//Cors setup, allow all for now
app.use(cors());

/**
 * Validate the JWT token passed in the request, to make sure the user is
 * authenticated and the token is valid before letting them through a 
 * specific route.
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 */
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decodedToken = jwt.verify(token,process.env.SECRET_KEY);
        req.id = decodedToken.id;

        db.collection("users").where("username", "==", req.id).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                if (doc.data()) {
                    return next();
                } else {
                    throw "error";
                }
            });
        })
        .catch((error) => {
            throw error;
        });
    } catch(error) {
        res.status(401).send({ error: "Not Authorized" });
    }
}

//User registration route
app.post('/api/registration', (req, res) => {
    //Destructure variables from the body
    let {name, email, password, username} = req.body;

    //User object
    const user = {
        name: name,
        email: email,
        password: password,
        username: username
    }

    bcrypt.hash(password, 8).then((hash) => {
        //Set the password to hash value
        user.password = hash;
    })
    .then(() => {
        db.collection("users")
        .add(user)
        .then((docRef) => {
            //On successfull registration
            return res.status(201).send({
                userdata: user,
                message: "Successfully Registered"
            })
        })
        .catch((error) => {
            //On failed registration
            return res.status(400).send({
                message: "Registration Failed"
            })
        });
    })
});

//User login route
app.post('/api/login', (req, res) => {
    //Destructure variables from the body
    const {email, password} = req.body;

    db.collection("users").where("email", "==", email)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            //Check if password matches
            bcrypt.compare(password, doc.data().password)
            .then((isMatch) => {
                if (isMatch === false) {
                    return res.status(401).send({
                        message:"Incorrect Password"
                    })
                }

                //Generate token if password is correct
                const token = jwt.sign({ id: doc.data().username.toString() }, process.env.SECRET_KEY);

                return res.status(200).send({
                    message: "Logged in Successfully",
                    user: doc.data(),
                    token
                })
            })
        });
    })
    .catch((error) => {
        return res.status(401).send({
            message:'User Does Not Exist'
        })
    });
});

app.post('/secret-route', authenticateUser, (req, res) => {
    console.log(req.id);
    res.send('This is the secret content. Only logged in users can see this!');
});

app.get('/', (req, res) => {
    res.send('<h1>SSS BACKEND API - V1.1</h1>')
})

app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));