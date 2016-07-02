'use strict';
exports.up = function(knex, Promise) {
  return knex.schema.renameTable('users_in_group', 'payments');
};

exports.down = function(knex, Promise) {
return knex.schema.renameTable('payments', 'users_in_group');
};
