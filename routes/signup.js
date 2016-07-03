'use strict';
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../db/knex');
var promise_result = require('../promise');

// get login page

router.get('/', function(req, res, next) {
<<<<<<< HEAD
    knex('users').then(function(data) {
        res.render('pages/signup', {
            data: data
        });
    }).catch(next);
=======

  knex('users').then(function(data){
    res.render('pages/signup', {
      data: data
    });
  }). catch(next);
>>>>>>> login_hashing

});


// allow users to log in with a hashed password.
//by using a required promise.
router.post('/', function(req, res, next) {
<<<<<<< HEAD
    // req.body is undefined for some reason (?)
    console.log(req.body);
    promise_result.hash(req.body.password).then(function(result) {

        knex('users').insert({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: result,
            email: req.body.email,

        }).then(function(data) {
            res.json({
                success: true,
                message: 'ok'
            });
        }).catch(next);
=======
  // req.body is undefined for some reason (?)

promise_result(req.body.password).then(function(result){

            knex('users').insert({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: result,
                email: req.body.email,

            }).then(function(data){
                res.redirect('/login');
            }).catch(next);
        });
>>>>>>> login_hashing
    });
});

module.exports = router;
