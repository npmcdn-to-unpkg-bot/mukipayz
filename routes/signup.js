'use strict';
var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../db/knex');
var promise_result= require('./promise');

router.get('/', function(req, res, next) {
  knex('users').then(function(data){
    res.render('pages/signup', {
      data: data
    });
  }). catch(next);

});


router.post('/', function(req, res, next) {
  // req.body is undefined for some reason (?)
console.log('test: '+ req.body);
promise_result.hash(req.body.password).then(function(result){

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

module.exports=router;
