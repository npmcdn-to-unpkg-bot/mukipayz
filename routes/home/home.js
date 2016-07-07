'use strict';

var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
var uploader = require('../../uploader');
var Promise = require('bluebird');
var moment = require('moment');
// var promise_result= require('./promise');
var db_model = require('../../db_models');
var promise_result = require('../../promise');
var randomstring = require("randomstring");
var email = require('../../emailer');
function Bills() {
    //model for bills table
    return knex('bills');
}
function Messages() {
    return knex('messages_in_group');
}

//---------BELOW
router.get('/payment', function(req, res, next) {
    res.render('pages/payment');
});
//-------ABove

router.get('/', function(req, res, next) {
    Promise.join(
        db_model.getUser(req.session.user.email),
        db_model.getUsersGroups(req.session.user.email),
        //friends model not yet fully functional
        db_model.getUsersFriends(req.session.user.email)
    ).then(function(data) {
        data = {
            user: data[0],
            groups: data[1],
            friends: data[2]
        };
        // res.json(data);
        res.render('pages/home', {
            user: data.user,
            groups: data.groups,
            friends: data.friends
        });
    });
});

router.get('/group/new', function(req, res, next) {
    knex('groups').then(function(data) {
        res.render('pages/newgroup', {
            data: data
        });
    }).catch(next);
});

router.post('/group/new', function(req, res, next) {
    knex('groups').insert({
        group_name: req.body.groupName
    }).returning('*').then(function(result) {
        knex('users_in_group').insert({
                user_id: req.session.user.user_id,
                group_id: result[0].id
            })
            .then(function(data) {

                res.redirect('/home');
            });
    });
});


router.get('/group/:id', function(req, res, next) {
    console.log("req.session.user: ", req.session.user);
    Promise.join(
        db_model.getGroup(Number(req.params.id)),
        knex('bills').where({
            group_id: Number(req.params.id)
        }),
        db_model.getGroupMessages(Number(req.params.id)),
        db_model.getGroupFriends(Number(req.params.id))
    ).then(function(data) {
        data = {
            group: data[0],
            bills: data[1],
            messages: data[2],
            friends: data[3]
        };
        data.messages.map(function(message) {
            message.fromMe = false;
            message.last_name = message.last_name.substr(0, 1) + '.';
            message.created_at = moment(message.created_at).fromNow();
            //setup bubbling
            if (req.session.user.user_id) {
                if (req.session.user.user_id === message.user_id) {
                    message.fromMe = true;
                } else {
                    message.fromMe = false;
                }
            }
        });
        // res.json(data);
        // if(data[0].length>0){
        res.render('pages/group', data);
    });

});



router.delete('/group/:id', function(req, res) {
    knex('users_in_group')
        .where({
            'group_id': req.params.id,
            'user_id': req.session.user.user_id
        })
        // .where(req.session.user.user_id, 'user_id')
        .del()
        .then(function() {
            res.redirect('/home');
        });
});

router.get('group/edit', function(req, res, next) {
    knex('groups').then(function(data) {
        res.render('pages/group/edit', {
            data: data
        });
    }).catch(next);
});

router.get('/group/:group_id/bills/new', function(req, res, next) {
    var group = {
        id: req.params.group_id
    };
    res.render('pages/newBill', {
        group: group
    });
});

router.post('/group/:group_id/bills/new', function(req, res, next) {
    var data = {}
    uploader.upload(req).then(function(uploaded) {
        data.uploadData = uploaded;
        data.uploadData.group_id = req.params.group_id;
        uploader.toCloud(data.uploadData.image.file).then(function(result) {
            data.cloudData = result;
            uploader.toDatabase({
                cloud: data.cloudData,
                upload: data.uploadData
            }).then(function(db_data) {
                res.redirect('/home/group/' + req.params.group_id);
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

router.get('/group/:group_id/add', function(req, res, next) {
    var group = {
        id: req.params.group_id
    };
    console.log(group);
    res.render('pages/addUserGroup', {
        group: group
    });
});

router.post('/group/:group_id/add', function(req, res, next) {
    console.log(req.body.invite_email);

    console.log(req.params.group_id);
    knex('users').join('users_in_group', 'users.id', 'users_in_group.user_id').where('users.email', req.body.invite_email)
        // knex('users_in_group')
        .then(function(data) {
            console.log("THIS IS IT: " + data);

            if (data.length > 0) {
                console.log(data[0].id);
                knex('users_in_group').insert({
                        user_id: data[0].user_id,
                        group_id: req.params.group_id
                    })
                    //  })
                    .then(function(data) {
                        res.redirect('/home');
                    });
            } else {
                var password = randomstring.generate(7);
                promise_result(password)
                    //console.log(promise_result("wow"))
                    .then(function(result) {

                        return knex('users').insert({
                            email: req.body.invite_email,
                            first_name: 'anonymous',
                            last_name: 'user',
                            password: result
                        }).returning('*');
                    }).then(function(results) {
                        console.log("RESULT from database stuff" + results[0]);
                        return knex('users_in_group').insert({
                                user_id: results[0].id,
                                group_id: req.params.group_id
                            }).returning('*')
                            .then(function(result) {
                                res.send('do it');
                                //call email
                                email(req.body.invite_email, function(err, body) {
                                    if (err) {
                                        res.render('email/error', {
                                            error: err
                                        });
                                        console.log("got an error: ", err);
                                    }
                                    // //Else we can greet    and leave
                                    else {
                                        //Here "submitted.ejs" is the view file for this landing page
                                        //We pass the variable "email" from the url parameter in an object rendered by ejs
                                        res.render('pages/addUserGroup', {
                                            success: "you invited a user"
                                        });
                                        console.log(body);
                                    }
                                });

                            });
                    });
            }
        }).catch(function(err) {
            console.error("ERROR: ", err);
        });
});



router.get('/group/bills/:id/pay', function(req, res, next) {


});

router.get('/group/:group_id/bills/:bill_id', function(req, res, next) {
    Promise.join(
      Bills().where({group_id: req.params.group_id, id: req.params.bill_id}),
        db_model.numberOfMembersPerGroup(req.params.group_id)
    ).then(function(data) {

      var obj = {
        bill : data[1],
        numUsers: data[0],
        totalPerUser: Number(data[0][0].amount) / Number(data[1][0].count)
      }
      // res.json(obj);

       res.render('pages/billview', obj);
   }).catch(function(err) {
       console.error(err);
   });

});

//create new message
router.get('/group/:id/messages/new', function(req, res, next) {
    res.render('pages/newMessage', {
        group: {
            id: req.params.id
        }
    });
});

router.post('/group/:id/messages/new', function(req, res, next) {
    Messages().insert({
        content: req.body.message,
        user_id: req.session.user.user_id,
        group_id: req.params.id
    }).then(function(data) {
        res.redirect('/home/group/'+req.params.id+'/');
    }).catch(function(err) {
        console.error("error saving message");
    });
});


module.exports = router;
