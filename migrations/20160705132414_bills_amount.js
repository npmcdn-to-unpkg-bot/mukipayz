'use strict';
exports.up = function(knex, Promise) {
  return knex.schema.table('bills', function(table){
    table.integer('amount');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('bills', function(table){
  table.dropColumn('amount');
});
};
