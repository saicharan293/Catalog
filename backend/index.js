const express = require('express');
const userModel = require('./models/userModel')
const app = express();
const passport = require('passport')
const bcrypt= require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

app.use(express.json());
app.use(session({ secret: process.env.MY_SECRET, resave: false, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    return done(null, profile); // Pass user profile to the next step
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


//this is only for mongo db

app.post('/signup-user',async(req,res)=>{
    let {fullName,email,password} = req.body;
    const existingUser = await userModel.findOne({email})
    if(existingUser) return res.status(403).json({error:true, message:"user already exist"});

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
            let newuser= await userModel.create({
                fullName,email,password:hash
            })
            // let token=jwt.sign({email},secretKey);
            res.send(newuser);
            res.status(200).json(newuser);
        })
    })
})

app.post('/login-user',async(req,res)=>{
    let existingUser = await userModel.findOne({email:req.body.email});
    if(!existingUser) return res.send("Something went wrong");

    console.log(existingUser.password,req.body.password);
    bcrypt.compare(req.body.password, existingUser.password,(err, result)=>{
        // console.log(result)
        if(result) res.status(200).json({message: 'Login successful',email:req.body.email})
        else res.status(401).json('Something went wrong')
    })
})


//this is google integration
app.get('/google/signup', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
    async (req, res) => {
        // Successful authentication, redirect home or respond
        const { id, displayName, emails, photos } = req.user;
        let user = await userModel.findOne({ googleId: id });
        if (!user) {
            // Create a new user if not found
            user = await userModel.create({
                googleId: id,
                name: displayName,
                email: emails[0].value,
                photo: photos[0].value
            });
        }

        res.json({
            success: true,
            message: 'User authenticated successfully',
            user: {
                id: user.googleId,
                name: user.name,
                email: user.email,
                photo: user.photo,
                createdAt: user.createdAt
            }
        });
    }
);

app.get('/auth/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Google authentication failed'
    });
});

app.listen(3000,()=>console.log('server shuru'))

