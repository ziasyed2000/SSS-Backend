/**
 * BACKEND SERVER FOR CAPSTONE PROJECT
 * 
 * ********** WILL CLEAN UP THE CODE LATER **********
 */

const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();


/////////////////////////////////////////////////////////////////////
const firebase = require("firebase");
require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API,
    authDomain: "sss-capstone.firebaseapp.com",
    projectId: "sss-capstone",
    storageBucket: "sss-capstone.appspot.com",
    messagingSenderId: "318786886535",
    appId: "1:318786886535:web:821c3610e25f2a1a329122"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();
/////////////////////////////////////////////////////////////////////


const app = express();
const PORT = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
app.use(cors());

const auth=async(req,res,next)=>{

    try{
        const idToken=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(idToken,process.env.SECRET_KEY)
        req.id=decoded.id
        db.collection("users").where("username", "==", req.id)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.data());
                if (doc.data()) {
                    return next();
                } else {
                    throw "error";
                }
            });
        })
        .catch((error) => {
            throw "error";
        });
        
    }catch(e){
          res.status(401).send({error: "please authenticate."})
    }
}

//register routes
app.post('/api/registration', (req, res) => {
    let{name, email,password,username}=req.body
    //creating user object
    const user={
        name: name,
        email: email,
        password: password,
        username: username
    }

    // username is available
    bcrypt.hash(password, 8).then((hash)=> {
        //set the password to hash value
        user.password=hash
    }).then(()=>{
        db.collection("users")
        .add(user)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);

            return res.status(201)
            .send({
                userdata:user,
                msg:"successfully registered"
            })
        })
        .catch((error) => {
            console.error("Error adding document: ", error);

            return res.status(400)
            .send({
                msg: "Error registering user"
            })
        });
    })
});

app.post('/api/login', (req, res) => {
    const {email,password}=req.body

    db.collection("users").where("email", "==", email)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.data());
            //check password
            bcrypt.compare(password,doc.data().password).then(isMatch=>{
                if(isMatch===false){
                    return res.status(401).send({
                        msg:"Password is incorrect "
                    })
                }

                //generate token
                const token=jwt.sign({id:doc.data().username.toString()},process.env.SECRET_KEY)   
                return res.status(200).send({
                    msg:"logged in successfully",
                    user:doc.data(),
                    token
                })
            })
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
        return res.status(401).send({
            msg:'no user exists with this email'
        })
    });
});

app.post('/secret-route', auth, (req, res) => {
    console.log(req.id);
    res.send('This is the secret content. Only logged in users can see this!');
});

app.get('/', (req, res) => {
    res.send('<h1>SSS BACKEND API - V1.1</h1>')
})

app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));