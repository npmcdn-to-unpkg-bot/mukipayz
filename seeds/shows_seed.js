'use strict';

exports.seed = function(knex, Promise) {
    return knex('users').del()
    .then(function() { //insert seed entries one by one
        return knex('users').insert({
            first_name: "tiffany",
            last_name: "coils",
            email: "tiffcoils@garage.com",
            password: "43sdf45rh??sdfgdfag"
        });
    });
};
