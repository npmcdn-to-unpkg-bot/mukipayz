'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
// var promise_result= require('./promise');


function Bills() {
    //model for bills table
    return knex('bills');
}

router.get('/', function(req, res, next) {

   console.log(req.session.user);
    knex('users')
      .where('users.email', req.session.user.email)
        .leftOuterJoin('users_in_group', 'users.id', 'users_in_group.user_id')
        .leftOuterJoin('groups', 'users_in_group.group_id', 'groups.id')
        .where('users.email', req.session.user.email)
        .then(function(data) {
            res.send(data);
            // res.render('pages/home', {
            //     data: data[0]
            // });

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
  console.log(req.body.groupName);
  knex('groups').insert({
    group_name: req.body.groupName
  }).returning('*')
  .then(function(result){
    knex('users_in_group').insert({
        user_id: req.session.user.user_id,
        group_id: result[0].id
    })
  .then(function(data){
    // res.send(data);
    res.redirect('/home');
  });
});
});

//
// router.get('/groups/:id', function(req, res, next) {
//     knex('users').where({
//             email: req.session.user.email
//         })
//         .then(function(data) {
//             res.render('/', {
//                 data: data
//             });
//
//         });
// });

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

router.get('/group/:id/messages', function(req, res, next){
  knex('').then(function(data) {
      res.render('pages/login', {
          data: data
      });
  }).catch(next);

});

// });

router.get('/group/:id', function(req, res, next){

});
module.exports = router;
