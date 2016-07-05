'use strict';
exports.up = function(knex, Promise) {
  return knex.schema.table('bills', function(table){
    table.float('amount', 2);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('bills', function(table){
  table.dropColumn('amount');
});
};
