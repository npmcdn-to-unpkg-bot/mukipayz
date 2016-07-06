'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.createTable('payments', function(table) {
        table.increments();
        table.float('amount').notNullable();
        table.integer('user_id').notNullable().references('id').inTable('users');
        table.integer('bill_id').notNullable().references('id').inTable('bills');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('payments');
};
