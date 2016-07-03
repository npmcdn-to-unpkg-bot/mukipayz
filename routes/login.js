'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../db/knex');
//var promise_result= require('./promise');



router.get('/', function(req, res, next) {
  knex('users').then(function(data){
    res.render('pages/login', {
      data: data
    });
    //res.send(data);
    // res.render('/login', {
    //   data:data
    // });
  }). catch(next);

});


module.exports = router;
