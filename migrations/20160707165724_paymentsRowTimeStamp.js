'use strict';
exports.up = function(knex, Promise) {
return knex.schema.table('payments', function(table){
  table.timestamp('created_at').defaultTo(knex.fn.now());

});
};

exports.down = function(knex, Promise) {
  return knex.schema.table('payments', function(table){
  table.dropColumn('created_at');
});
};
