'use strict';
exports.up = function(knex, Promise) {
  return knex.schema.createTable('groups', function(table){
    table.increments();
    table.string('group_name').notNullable();
    table.timestamp('deleted_at').defaultTo(null);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('groups');

};
