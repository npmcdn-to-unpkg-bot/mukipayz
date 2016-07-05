'use strict';
//this migration is called dwolla but I am actually going to create
//bills because I want all our tables created that don't rely on the
//info we get back created first.

exports.up = function(knex, Promise) {
    return knex.schema.createTable('bills', function(table){
        table.increments();
        table.string('title');
        table.string('image_url');
        table.integer('group_id').notNullable().references('id').inTable('groups');
        table.boolean('paid');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('bills');
};
