const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
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

module.exports = passport;