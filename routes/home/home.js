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

router.get('/group/new', function(req, res, next){

});


router.get ('groups/:id', function(req, res, next){

});

router.get ('group/edit', function(req, res, next){

});

router.get ('group/:id/bills/:id', function(req, res, next){

});

router.get('group/bills/new', function(req, res, next){

});

router.get('group/bills/:id/pay', function(req, res, next){

});

<<<<<<< HEAD
=======

>>>>>>> b837f11445d9c2dace89ccd74e8e26580de2b437
module.exports = router;
