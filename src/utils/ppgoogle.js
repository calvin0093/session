const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");
require("dotenv").config()


// // Cấu hình Client ID và Client Secret của ứng dụng Google
const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;

// Cấu hình URL của trang callback
const callbackURL = 'http://localhost:3000/auth/google/callback';

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL,
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log("connect google passport", profile, accessToken);
        // console.log(profile.emails[0].value);
        try {
            const user = await User.findOne({ where: { email: profile.emails[0].value } })
            if (user) {
                return done(null, user)
            } else {
                const newUser = {
                    email: profile.emails[0].value
                }
                const user = await User.create(newUser)
                return done(null, user)
            }
        } catch (error) {
            console.log(error);
        }
    }

    ));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findByPk(id, function (err, user) {
            done(err, user);
        });
    });


}

