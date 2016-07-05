'use strict';

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
// var promise_result= require('./promise');



router.get('/', function(req, res, next) {
  res.send("test");
    // knex('users').then(function(data) {
    // res.send(data);
    //     res.render('pages/home', {
    //         data: data
    //     });
    // }).catch(next);

});
