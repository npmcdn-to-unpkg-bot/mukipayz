'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
var uploader = require('../../uploader');
var Promise = require('bluebird');
// var promise_result= require('./promise');


function Bills() {
    //model for bills table
    return knex('bills');
}

router.get('/', function(req, res, next) {

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
    knex('groups').insert({
        group_name: req.body.groupName
    }).returning('*').then(function(result) {
        knex('users_in_group').insert({
            user_id: req.session.user.user_id,
            group_id: result[0].id
        })
        .then(function(data){
            res.send(data);
            // res.redirect('/');
        });
    });
});



router.get('/group/:id', function(req, res, next) {
    Promise.join(
        knex('bills').where({group_id:Number(req.params.id)}),
        knex('messages_in_group').where({group_id:Number(req.params.id)})
    ).then(function(data) {
        //Promise.join will join the data of multiple promises
            //So data[0] == bills array, data[1] == messages in that group
        //data = [all-bills, all-messages] for that id
        //try res.json(data); to see all data returned
        var joined = {
            bills: data[0],
            messages: data[1]
        };
        if (joined.bills.length === 0) {
            joined.bills = null;
        }
        if (joined.messages.length === 0) {
            joined.messages = null;
        }
        // res.json(joined.bills);
        //**to use in view, data.bills or data.messages
        res.render('pages/group', {
            data: joined
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
    var data = {}
    uploader.upload(req).then(function(uploaded) {
        data.uploadData = uploaded;
        data.uploadData.group_id = req.params.group_id;
        uploader.toCloud(data.uploadData.image.file).then(function(result) {
            data.cloudData = result;
            uploader.toDatabase({cloud:data.cloudData, upload:data.uploadData}).then(function(db_data) {
                res.redirect('/home/group/'+req.params.group_id);
            }).catch(function(err) {
                console.error("Error saving to database", err);
            });
        }).catch(function(err) {
            console.error("Error saving to cloud:", err);
        });
    }).catch(function(err) {
        console.error("Error saving to filesystem", err);
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


router.get('/group/:id/messages', function(req, res, next){
  knex('messages_in_group').then(function(data) {
    res.send(data);
      // res.render('pages/group', {
      //     data: data[0]
      // });
  }).catch(next);
});





module.exports = router;
