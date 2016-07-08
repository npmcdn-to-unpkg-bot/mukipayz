'use strict';
exports.up = function(knex, Promise) {
    return knex.schema.table('bills', function(table) {
        table.integer('bill_owner').notNullable().references('id').inTable('users');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('bills', function(table) {
        table.dropColumn('bill_owner').default;
    });
};
