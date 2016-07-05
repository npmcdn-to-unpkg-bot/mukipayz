'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('dwolla', function(table) {
        table.increments();
        table.integer('user_id').notNullable().references('id').inTable('users');
        table.string('dwolla_id').notNullable();
        table.string('dwolla_account_id').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('dwolla');
};
