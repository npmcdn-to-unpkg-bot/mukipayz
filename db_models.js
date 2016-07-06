'use strict';
var knex = require('./db/knex');
var Promise = require('bluebird');
var moment = require('moment');

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
function getGroup(group_id) {
    return new Promise(function(resolve, reject) {
        Groups().where({id: group_id}).then(function(group){
            resolve(group[0]);
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
function getGroupMessages(group_id, currUser_id) {
    return new Promise(function(resolve, reject) {
        Messages().where({group_id: group_id})
            .join('users', 'users.id', '=', 'messages_in_group.user_id')
            .select('users.id as user_id', 'content', 'users.first_name', 'users.last_name', 'messages_in_group.created_at')
            .orderBy('messages_in_group.created_at', 'desc')
            .then(function(messages) {
                messages.map(function(message) {
                    message.fromMe = false;
                    message.last_name = message.last_name.substr(0, 1) + '.';
                    message.created_at = moment(message.created_at).fromNow();
                    //setup bubbling
                    console.log("currUser_id: ", currUser_id);
                    if (currUser_id) {
                        if (currUser_id === message.user_id) {
                            message.fromMe = true;
                        } else {
                            message.fromMe = false;
                        }
                    }
                });
                resolve(messages);
            }).catch(reject);
    });
}
function getGroupFriends(group_id) {
    return new Promise(function(resolve, reject) {
        Users_In_Group().where({group_id: group_id})
            .join('users', 'users.id', '=', 'users_in_group.user_id')
            .select('first_name', 'last_name', 'email', 'users.id')
            .then(function(users) {
                resolve(users);
            }).catch(reject);
    });
}

function numberOfMembersPerGroup(group_id) {
    return new Promise(function(resolve, reject) {
        Users_In_Group().where({group_id: group_id})
            .count('*')
            // .select('first_name', 'last_name', 'email', 'users.id')
            .then(function(num_users) {
                resolve(num_users);
            }).catch(reject);
    });
}


module.exports = {
    getUser: getUser,
    getGroup: getGroup,
    getUsersFriends: getUsersFriends,
    getUsersGroups: getUsersGroups,
    getGroupMessages: getGroupMessages,
    getGroupFriends: getGroupFriends,
    numberOfMembersPerGroup: numberOfMembersPerGroup
};
