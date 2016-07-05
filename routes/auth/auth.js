'use strict';

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
// var promise_result= require('./promise');


//login stuff
router.get('/login', function(req, res, next) {
    knex('users').then(function(data) {
        res.render('pages/login', {
            data: data
        });
    }).catch(next);

});


//using bcrypt compare we check that the login password matches/info matches the Database

router.post('/login', function (req, res, next){
  console.log(req.body);
  knex('users').select('email', 'password').where({
    email:req.body.email
  }).then(function(data){
    console.log(data);
    if (data.length === 1){
      bcrypt.compare(req.body.password, data[0].password, function(err, result){
        if(result){
          res.send('login match');
          // res.render('user', {
          //   err:undefined,
          //   email:data[0].email,
          //   password:data[0].password
          // });
        } else {
          res.send('password err');
          // res.render('user', {
          //   //should change this to a redirect with error message for actual site but sometimes it is easer to see
          //   //this way
          //   err: 'email and passwords do not match'
          // });
        }
      });
    }
    else {
      res.send('not a user');
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
        res.render('pages/signup', {
            data: data
        });
    }).catch(next);



// allow users to log in with a hashed password.
//by using a required promise.
router.post('/signup', function(req, res, next) {

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

    });
});

module.exports = router;
