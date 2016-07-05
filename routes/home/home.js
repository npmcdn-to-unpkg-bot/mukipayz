'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
var uploader = require('../../uploader');
// var promise_result= require('./promise');


function Bills() {
    //model for bills table
    return knex('bills');
}

router.get('/', function(req, res, next) {

  //console.log(req.session.user.email);
    knex('users')
      .where('users.email', req.session.user.email)
        .leftOuterJoin('users_in_group', 'users.id', 'users_in_group.user_id')
        .leftOuterJoin('groups', 'users_in_group.group_id', 'groups.id')
        .where('users.email', req.session.user.email)
        .then(function(data) {
          // res.send(data);
            res.render('pages/home', {
                data: data
            });

        })
        .catch(function(err) {
            console.log(err);

        });
});


router.get('/group/new', function(req, res, next) {
    knex('groups').then(function(data) {
        res.render('pages/newgroup', {
            data: data
        });
    }).catch(next);
});

router.post('/group/new', function(req, res, next){
  knex('groups').insert({
    group_name: req.body.groupName
  })
  .then(function(data){
    res.send(data);
    // res.redirect('/');
  });
});


router.get('/groups/:id', function(req, res, next) {
    knex('users').where({
            email: req.session.user.email
        })
        .then(function(data) {
            res.render('/', {
                data: data
            });

        });
});

router.get('group/edit', function(req, res, next){

});

router.get('/group/:group_id/bills/new', function(req, res, next) {
    var group = {
        id: req.params.group_id
    };
    res.render('pages/newBill', {group:group});
});

router.post('/group/:group_id/bills/new', function(req, res, next) {
    uploader.upload(req).then(function(data) {
        console.log("data: ", data);
    });
});

router.get('/group/bills/:id/pay', function(req, res, next){


});
router.get('/group/:group_id/bills/:bill_id', function(req, res, next) {
    Bills().where({
        group_id: req.params.group_id,
        id: req.params.bill_id
    }).then(function(bill) {
        bill = bill[0];
        if (bill === undefined) {
            console.log("no bill");
            /**FIXME: Redirect Routes for Errors */
            res.send('bill not found');
        }
        res.render('pages/billview', {bill:bill})
    });
});





module.exports = router;
