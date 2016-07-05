'use strict';

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
// var promise_result= require('./promise');

function Bills() {
    //model for bills table
    return knex('bills');
}


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


router.get('groups/:id', function(req, res, next){

});

router.get('group/edit', function(req, res, next){

});

router.get('/group/:group_id/bills/:bill_id', function(req, res, next) {
    console.log("here?", req.query);
    Bills().where({
        id: req.params.bill_id
    }).then(function(bill) {
        bill = bill[0];
        res.render('pages/billview', {bill:bill})
    });
});

router.get('/group/bills/new', function(req, res, next){

});

router.get('/group/bills/:id/pay', function(req, res, next){

});


module.exports = router;
