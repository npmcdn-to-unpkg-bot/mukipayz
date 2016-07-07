'use strict';
var express = require('express'),
    router  = express.Router(),
    passport = require('passport'),
    DwollaStrategy = require('passport-dwolla').Strategy;

    DwollaStrategy.options = ({
        // authorizationURL: 
    });

var knex = require('../../db/knex');
var DB = {
    Dwolla: function() {
        return knex('dwolla');
    }
};



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Dwolla profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the DwollaStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Dwolla
//   profile), and invoke a callback with a user object.
passport.use(new DwollaStrategy({
    clientID: process.env.DWOLLA_KEY,
    clientSecret: process.env.DWOLLA_SECRET,
    callbackURL: "http://localhost:3000/auth/dwolla/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log("profile: ", profile);
    //   req.session.user = profile;
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Dwolla profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Dwolla account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// GET /auth/dwolla
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Dwolla authentication will involve
//   redirecting the user to dwolla.com.  After authorization, Dwolla
//   will redirect the user back to this application at /auth/dwolla/callback
router.get('/',
  passport.authenticate('dwolla', { scope: 'AccountInfoFull|Contacts|Transactions|Balance|Send|Request' }),
  function(req, res){
    // The request will be redirected to Dwolla for authentication, so this
    // function will not be called.
  });


// GET /auth/dwolla/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/callback',
    passport.authenticate('dwolla', { failureRedirect: '/auth/dwolla', successRedirect: '/' }),
    function(req, res) {

        if (req.user) {
            console.log("DWOLLA USER: ", req.user);
            // DB.Dwolla().insert({})
        }

        res.redirect('/');
    });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



module.exports = router;
