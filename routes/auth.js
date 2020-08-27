const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../keys');


router.get('/', (req, res) => {
    res.send("Hello Bajrangi bhai Jaan")
});


router.post('/signup',(req, res) => {
    const {name, email, password} = req.body;

    if(!email || !password || !name) {
        return res.status(422).json({error: "please add all the fields"})
    }

    User.findOne({email: email})
        .then((savedUser) => {
            if(savedUser) {
                return res.status(422).json({error: "User already exists with that email address."})
            }

                bcrypt.hash(password, 12)
                .then(hashedpassword => {

                    const user = new User({
                        email, 
                        password: hashedpassword,
                        name
                    })
        
                    user.save()
                    .then(user => {
                        res.json({message: "saved successfully"})
                    })
                    .catch(err => {
                        console.log(err);
                    })

                })

            
        })
        .catch(err => {
            console.log(err);
        })

   
});


router.post('/signin', (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(422).json({error: "Please provide both email and password"});
    }

    User.findOne({email: email})
    .then(savedUser => {
        if (!savedUser) {
            return res.status(422).json({error: "Invalid Email or password"});
        }

        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch) {
                //return res.json({message: "Successfully signed in"});
                const token = jwt.sign({_id: savedUser._id}, JWT_SECRET);
                res.json({token})
                //in the line above the key and the value ({token: token}) are both "token", hence it can just be written as a single {token}.

            } else {
                return res.status(422).json({error: "Invalid Email or password"})
            }
        })
        
        .catch(err => {
            console.log(err);
        })
      
    })
})

module.exports = router;


