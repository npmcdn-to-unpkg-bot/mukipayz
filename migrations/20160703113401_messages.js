'use strict';
exports.up = function(knex, Promise) {
return knex.schema.createTable('messages_per_group', function(table){
  table.increments();
  table.string('content');
  table.integer('user_id').notNullable().references('id').inTable('users');
  table.integer('group_id').notNullable().references('id').inTable('groups');
});
};

exports.down = function(knex, Promise) {
return knex.schema.dropTable('messages_per_group');
};
