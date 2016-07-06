'use strict';
var knex = require('./db/knex');
var Promise = require('bluebird');

function Users() {
    return knex('users');
}
function Users_In_Group() {
    return knex('users_in_group');
}
function Groups() {
    return knex('groups');
}
function Messages() {
    return knex('messages_in_group');
}

function getUser(email) {
    return new Promise(function(resolve, reject) {
        Users().where({email: email}).then(function(user){
            resolve(user[0]);
        }).catch(reject);
    });
}
function getUsersFriends(email) {
    /**FIXME: This Query is not correct! */
    return new Promise(function(resolve, reject) {
        getUser(email).then(function(user) {
            console.log("user: ", user);
            Users_In_Group()
                .join('groups', 'users_in_group.group_id', '=', 'groups.id')
                .join('users', 'users.id', '=', 'users_in_group.user_id')
                .whereNotIn('user_id', user.id)
                .select('user_id', 'email', 'group_id', 'group_name')
                .then(function(groups) {
                    resolve({
                        friends: groups,
                        disclaimer: "I don't think this query is correct, need to update"
                    });
                });
        });
    });
}

function getUsersGroups(email) {
    return new Promise(function(resolve, reject) {
        Users().where({email: email})
            .then(function(user) {
                user = user[0];
                Promise.join(
                    Users_In_Group()
                        .where({user_id:user.id})
                        .join('groups', 'groups.id', '=', 'users_in_group.group_id')
                ).then(function(data) {
                    resolve(data[0]);
                });
            }).catch(reject);
    });
}
function getGroupMessages(group_id) {
    return new Promise(function(resolve, reject) {
        Messages().where({group_id: group_id})
            .then(function(messages) {
                resolve(messages);
            }).catch(reject);
    });
}


module.exports = {
    getUser: getUser,
    getUsersFriends: getUsersFriends,
    getUsersGroups: getUsersGroups,
    getGroupMessages: getGroupMessages
};
