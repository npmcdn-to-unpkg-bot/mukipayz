'use strict';
var knex = require('./db/knex');

var middleware = {
    isLoggedIn: function(req, res, next) {

        //to access /home routes, user must be logged in
        if (!req.session.user) {
            //if user is not logged in
            return res.redirect('/auth/login');
        }
        return next()
    },
    hasAccessToGroup: function(req, res, next) {
        knex('users_in_group').where({
            group_id: req.params.group_id,
            user_id: req.session.user.user_id
        }).then(function(access) {
            if (!access[0]) {
                //user doesn't have access
                return res.redirect('/home');
            }
            return next();
        });
    },
    groupExists: function(req, res, next) {
        //check if that group @ id exists, if not, route to /home
        knex('groups').where({id: req.params.group_id}).then(function(group) {
            if (!group[0]) {
                //group doesn't exist
                return res.redirect('/home');
            }
            //group exists, ok to continue
            return next();
        });
    }
};


module.exports = middleware;
