require('dotenv').config();
const express = require('express');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const db = require('./db');
const User = require('./user');

passport.use(new Strategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName']
},
    (accessToken, refreshToken, profile, cb) => {
        let user = {
            id: profile.id,
            displayName: profile.displayName,
            accessToken: accessToken
        };
        User.findOneAndUpdate({ id: profile.id }, user, { upsert: true, useFindAndModify: false, new: true }, (err, user) => {
            console.log("user:", user.id, user.displayName);
            return cb(null, user);
        });
    })
);

passport.serializeUser((user, cb) => {
    console.log("serializeUser:", user.id);
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    console.log("deserializeUser:", id);
    User.findOne({id: id}, (err, user) => {
        cb(null, user);
    });
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'kek', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    console.log('Home', req.session.id);
    res.send("Home");
});

app.get('/success', (req, res) => {
    if(!req.isAuthenticated()){
        res.redirect('/auth/facebook');
    } else {
        console.log('/success user:', req.user.id, req.isAuthenticated());
        res.send("Success " + (req.user ? req.user.displayName : "..."));
    }
});

app.get('/fail', (req, res) => {
    console.log('/fail');
    res.send("KO");
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get("/auth/facebook/callback", passport.authenticate("facebook", { successRedirect: '/success', failureRedirect: '/fail' }));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server listening...")
});
