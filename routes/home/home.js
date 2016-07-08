'use strict';
//variables
var express = require('express');
var router = express.Router();
// var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
var uploader = require('../../uploader');
var Promise = require('bluebird');
// var promise_result= require('./promise');
var db_model = require('../../db_models');
var promise_result = require('../../promise');
var randomstring = require("randomstring");
var email = require('../../emailer');
var mware = require('../../middleware');
var moment = require('moment');
//end variables
function Bills() {
    //model for bills table
    return knex('bills');
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
router.get('/userUpdate', function(req, res, next) {
    knex('users').where('id', req.session.user.user_id)
        .then(function(data) {
            //console.log(data)
            res.render('pages/userUpdate', {
                data: data[0]
            });
        }).catch(next);
});
router.put('/userUpdate', function(req, res) {
    promise_result(req.body.password).then(function(result) {
        knex('users')
            .where('id', req.session.user.user_id)

        .update({
                'first_name': req.body.first_name,
                'last_name': req.body.last_name,
                'email': req.body.email,
                password: result
            })
            .then(function(result) {
                // var timefrom=moment(posts.time).fromNow();
                // console.log(timefrom);
                res.redirect('/home');
            })
            .catch(function(err) {
                next(err);
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
//user has access to that group middleware
router.use('/group/:group_id', mware.hasAccessToGroup);
//group exists middleware
router.use('/group/:group_id', mware.groupExists);
router.get('/group/:id', function(req, res, next) {
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
            if (message.user_id === req.session.user.user_id) {
                message.fromMe = true;
            }
        });

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
    var data = {};
    uploader.upload(req).then(function(uploaded) {
        data.uploadData = uploaded;
        data.uploadData.group_id = req.params.group_id;
        data.uploadData.bill_owner = req.session.user.user_id;
        uploader.toCloud(data.uploadData.image.file).then(function(result) {
            data.cloudData = result;
            uploader.toDatabase({
                cloud: data.cloudData,
                upload: data.uploadData
            }).then(function(db_data) {
                uploader.removeFromDir(data.uploadData).then(function(success) {});
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
    // console.log(group);
    res.render('pages/addUserGroup', {
        group: group
    });
});


router.post('/group/:group_id/add', function(req, res, next) {
    knex('users').join('users_in_group', 'users.id', 'users_in_group.user_id').where('users.email', req.body.invite_email)
        // knex('users_in_group')
        .then(function(data) {
            if (data.length > 0) {
                knex('users_in_group').insert({
                        user_id: data[0].user_id,
                        group_id: req.params.group_id
                    })
                    .then(function(data) {
                        var group = {
                            id: req.params.group_id
                        };
                        //console.log(group);
                        res.render('pages/addUserGroup', {
                            group: group
                        });
                    });
            } else {
                var password = randomstring.generate(7);
                promise_result(password)
                    .then(function(result) {
                        return knex('users').insert({
                            email: req.body.invite_email,
                            first_name: 'anonymous',
                            last_name: 'user',
                            password: result
                        }).returning('*')
                    }).then(function(results) {
                        return knex('users_in_group').insert({
                                user_id: results[0].id,
                                group_id: req.params.group_id
                            }).returning('*')
                            .then(function(result) {
                                email(req.body.invite_email, password, function(err, body) {
                                    if (err) {
                                        res.render('email/error', {
                                            error: err
                                        });
                                        console.log("got an error: ", err);
                                    } else {
                                        var group = {
                                            id: req.params.group_id
                                        };
                                        res.render('pages/addUserGroup', {
                                            group: group
                                        });
                                    }
                                });
                            });
                    });
            }
        }).catch(function(err) {
            console.error("ERROR: ", err);
        });
});
//user has access to that group middleware
router.use('/group/:group_id/bills/:bill_id', mware.billExists);

router.get('/group/:group_id/bills/:bill_id', function(req, res, next) {
    Promise.join(
        Bills().where({
            group_id: req.params.group_id,
            id: req.params.bill_id
        }),
        db_model.numberOfMembersPerGroup(req.params.group_id),
        knex('payments').where({
            user_id: req.session.user.user_id,
            bill_id: req.params.bill_id
        }).sum('amount')
    ).then(function(data) {

        var count = Number(data[1][0].count);
        var totalAmount = Number(data[0][0].amount);
        var sum = Number(data[2][0].sum);
        var owed = Number(((totalAmount / count) - sum).toFixed(2));
        if (Number(((totalAmount / count) - sum).toFixed(2)) <= 0) {
            owed = 0;
        }
        var obj = {
            bill: data[1],
            numUsers: data[0],
            group_id: req.params.group_id,
            bill_id: req.params.bill_id,
            totalPerUser: owed

        };
        return res.render('pages/billview', obj);
    });
});

router.post('/group/:group_id/bills/:bill_id', function(req, res, next) {
    knex('payments').insert({
        amount: parseFloat(req.body.manPayment),
        user_id: req.session.user.user_id,
        bill_id: Number(req.params.bill_id)
    }).then(function(data) {
        Promise.join(
            Bills().where({
                group_id: req.params.group_id,
                id: req.params.bill_id
            }),
            db_model.numberOfMembersPerGroup(req.params.group_id),
            knex('payments').where({
                user_id: req.session.user.user_id,
                bill_id: req.params.bill_id
            }).sum('amount')
        ).then(function(data) {
            var count = Number(data[1][0].count);
            var totalAmount = Number(data[0][0].amount);
            var sum = Number(data[2][0].sum);
            var owed = Number(((totalAmount / count) - sum).toFixed(2));
            if (Number(((totalAmount / count) - sum).toFixed(2)) <= 0) {
                owed = 0;
                knex("bills").update({
                    paid: true
                }).where({id: req.params.bill_id}).then(function(data) {
                    return res.redirect('/home/group/'+req.params.group_id+'/bills/'+req.params.bill_id);
                });
            } else {
                return res.redirect('/home/group/'+req.params.group_id+'/bills/'+req.params.bill_id);
            }
        }).catch(function(err) {
            return res.redirect('/home/group/'+req.params.group_id+'/bills/'+req.params.bill_id);
        });
    }).catch(function(err) {
        return res.redirect('/home/group/'+req.params.group_id+'/bills/'+req.params.bill_id);
    });;
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
    knex('messages_in_group').insert({
        content: req.body.message,
        user_id: req.session.user.user_id,
        group_id: req.params.id
    }).returning('*').then(function(data) {
        var message = data[0];
        message.created_at = moment(message.created_at).fromNow();
        knex('users').where({id:message.user_id}).then(function(user) {
            user = user[0];
            user = {
                first_name: user.first_name,
                last_name: user.last_name
            };
            res.json({
                status: 'success',
                message: message,
                user: user
            });
        }).catch(function(err) {
            console.error("error saving message: ",err);
        });
    }).catch(function(err) {
        console.error("error saving message: ", err);
    });
});



module.exports = router;
