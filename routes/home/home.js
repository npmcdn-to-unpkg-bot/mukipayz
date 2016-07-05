'use strict';

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var knex = require('../../db/knex');
// var promise_result= require('./promise');
knex('posts')
    .leftJoin('comments', 'posts.id', 'comments.post_id')
    .select('posts.content', 'comments.reply')
    .where('posts.id', Number(req.params.id))
    .then(function(posts) {
        console.log(posts);
        res.render('reddit/list', {
            post: posts[0],
        });
    })
    .catch(function(err) {
        console.log(err);

    });


router.get('/', function(req, res, next) {
    knex('users')
        .join('users_in_group', 'users.id', 'users_in_group.user_id')
        .join('groups', 'users_in_group.group_id', 'groups.id')
        .where({
            email: req.session.user.email
        })
        .then(function(data) {
            res.render('/', {
                data: data
            });

        })
        .catch(function(err) {
            console.log(err);
        });
});


router.get('/group/new', function(req, res, next) {
    knex('group').then(function(data) {
        res.render('pages/newgroup', {
            data: data
        });
    }).catch(next);
});


router.get('groups/:id', function(req, res, next) {
    knex('users').where({
            email: req.session.user.email
        })
        .then(function(data) {
            res.render('/', {
                data: data
            });

        });
});

router.get('group/edit', function(req, res, next) {

});

router.get('group/:id/bills/:id', function(req, res, next) {

});

router.get('group/bills/new', function(req, res, next) {

});

router.get('group/bills/:id/pay', function(req, res, next) {

});




module.exports = router;
