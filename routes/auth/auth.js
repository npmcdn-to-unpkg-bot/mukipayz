'use strict';

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
var promise_result = require('../../promise');

const hour = 3600000;


//login stuff
router.get('/login', function(req, res, next) {
    res.render('pages/login', {
        error: null
    });
});


//using bcrypt compare we check that the login password matches/info matches the Database

router.post('/login', function(req, res, next) {
    knex('users').where({
        email: req.body.email
    }).then(function(data) {
        // console.log("data: ", data);
        if (data.length === 1) {
            bcrypt.compare(req.body.password, data[0].password, function(err, result) {
                if (result) {
                    //stay logged in only for 24 hours
                    req.sessionOptions.maxAge = hour * 24;
                    req.session.user = {
                        loggedIn: true,
                        email: data[0].email,
                        user_id: data[0].id
                    };
                    res.redirect('/home');
                } else {
                    return res.render('pages/login', {
                        error: {
                            message: "Invalid user credentials, please try again",
                            signup: "Or sign up today!"
                        }
                    });
                }
            });
        } else {
            return res.render('pages/login', {
                error: {
                    message: "Invalid user credentials, please try again",
                    signup: "Or sign up today!"
                }
            });
            // res.send('whamma whamma ding dong, you are not a user');
            // res.render('user', {
            //   //should change this to a redirect for actual site but sometimes it is easer to see
            //   //this way
            //   err: 'log in error'
            // });
        }
    }).catch(next);

});

// sign up stuff
router.get('/signup', function(req, res, next) {

    knex('users').then(function(data) {
        res.render('pages/signup')
            //, {
            //data: data
            //});
    }).catch(next);

    // allow users to log in with a hashed password.
    //by using a required promise.
    router.post('/signup', function(req, res, next) {

        promise_result(req.body.password).then(function(result) {

            knex('users').insert({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: result,
                email: req.body.email,

            }).then(function(data) {
                res.redirect('/auth/login');
            }).catch(next);
        });

    });
});

router.get('/logout', function(req, res) {
    //logout main session user
    req.sessionOptions.maxAge = 0;
    req.session = null;
    res.redirect('/');
});

router.get('/payment', function(req, res) {
    res.render('pages/payment')
});

module.exports = router;
