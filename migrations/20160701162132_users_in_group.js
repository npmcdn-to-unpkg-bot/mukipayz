'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users_in_group', function(table) {
        table.increments().notNullable();
        table.string('content').notNullable();
        table.integer('user_id').notNullable().references('id').inTable('users');
        table.integer('group_id').notNullable().references('id').inTable('groups');
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users_in_group');

};
