'use strict';
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropColumn('e-mail');
    table.string('email').notNullable().unique();
});
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropColumn('email');
  });
};
