require('dotenv').config();
require('./db');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const passport = require('./auth-fb');
const User = require('./user');
let port = process.env.PORT || 8080;

app.disable('x-powered-by');
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'kek', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('dist'));
app.use(morgan('combined'));

app.get('/', (req, res) => {
    console.log('Home', req.session.id);
    res.send("Home");
});

app.get('/success', (req, res) => {
    if(!req.isAuthenticated()){
        console.log("/success: user not autenticated");
        res.redirect('/auth/facebook');
    } else {
        console.log('/success user:', req.user.id, req.isAuthenticated());
        res.redirect(process.env.FRONTEND_URL);
    }
});

let corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
    credentials: true
  }

app.get('/profile', cors(corsOptions), (req, res) => {
    console.log("/profile cookies:", req.cookies);
    if(req.isAuthenticated()){
        User.findOne({id: req.user.id}, (err, user) => {
            console.log("/profile auth OK", user);
            res.status(200).send(user);
        }); 
    } else {
        res.status(200).send();
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
    res.redirect(process.env.FRONTEND_URL);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});
