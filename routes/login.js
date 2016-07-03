'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../db/knex');
var promise_result= require('./promise');

router.get('/', function(req, res, next) {
  knex('users').then(function(data){
    res.render('pages/login', { title: 'login' });
    //res.send(data);
    // res.render('/login', {
    //   data:data
    // });
  }). catch(next);

});
//things to pass along to team
//in ejs input fields we need name to equal first_name, last_name and
// email to match this.
router.post('/', function(req, res, next) {
  // this is empty for some reason (?)
console.log(req.body);
promise_result.hash(req.body.password).then(function(result){

            knex('users').insert({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: result,
                email: req.body.email,

            }).then(function(data){
                res.redirect('/index');
            }).catch(next);
        });
    });



module.exports = router;
