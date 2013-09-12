var when = require('when');

module.exports = function(knex) {

  var SchemaInterface = require('../../../lib/schemainterface').SchemaInterface;
  var SchemaBuilder   = require('../../../lib/schemabuilder').SchemaBuilder;

  knex.schema.logMe = function() {
    return _.reduce(_.keys(SchemaInterface), function(memo, key) {
      memo[key] = function() {
        var schemaBuilder = new SchemaBuilder(knex);
        schemaBuilder.table = _.first(arguments);
        schemaBuilder.logMe();
        return SchemaInterface[key].apply(schemaBuilder, _.rest(arguments));
      };
      return memo;
    }, {});
  };

  it('has a dropTableIfExists method', function() {
    return when.all([
      knex.schema.dropTableIfExists('test_foreign_table_two'),
      knex.schema.dropTableIfExists('test_table_one'),
      knex.schema.dropTableIfExists('test_table_two'),
      knex.schema.dropTableIfExists('test_table_three'),
      knex.schema.dropTableIfExists('datatype_test'),
      knex.schema.dropTableIfExists('accounts'),
      knex.schema.dropTableIfExists('test_default_table')
    ]);
  });

  describe('createTable', function() {

    it('accepts the table name, and a "container" function', function() {
      return knex.schema.createTable('test_table_one', function(table) {
        table.engine('InnoDB');
        table.comment('A table comment.');
        table.bigIncrements('id');
        table.string('first_name');
        table.string('last_name');
        table.string('email').unique().nullable();
        table.integer('logins').defaultTo(1).index().comment();
        table.text('about').comment('A comment.');
        table.timestamps();
      });
    });

    it('is possible to set the db engine with the table.engine', function() {
      return knex.schema.createTable('test_table_two', function(table) {
        table.engine('InnoDB');
        table.increments();
        table.integer('account_id');
        table.text('details');
        table.tinyint('status');
      });
    });

    it('sets default values with defaultTo', function() {
      return knex.schema.createTable('test_table_three', function(table) {
        table.engine('InnoDB');
        table.integer('main').primary();
        table.text('paragraph').defaultTo('Lorem ipsum Qui quis qui in.');
      });
    });

    it('supports the enum and uuid columns', function() {
      return knex.schema.createTable('datatype_test', function(table) {
        table.enum('enum_value', ['a', 'b', 'c']);
        table.uuid('uuid');
      });
    });

    it('allows for setting foreign keys on schema creation', function() {
      return knex.schema.createTable('test_foreign_table_two', function(table) {
        table.increments();
        table.integer('fkey_two')
          .unsigned()
          .references('id')
          .inTable('test_table_two');
      });
    });

  });

  describe('table', function() {

    it('allows adding a field', function (done) {
      return knex.schema.table('test_table_two', function(t) {
        t.json('json_data').nullable();
      });
    });

    it('', function() {
      return knex.schema.table('test_table_one', function(t) {
        t.string('phone').nullable();
      });
    });

  });


  describe('hasTable', function() {

    it('checks whether a table exists', function() {
      var promise;
      return promise = knex.schema.hasTable('test_table_two').then(function() {

      });
    });

  });

  describe('renameTable', function() {

    it('renames the table from one to another', function () {
      return knex.schema.renameTable('test_table_one', 'accounts');
    });

  });

  describe('dropTable', function() {

    it('should drop a table', function() {

      return knex.schema.dropTable('test_table_three').then(function() {

        // Drop this here so we don't have foreign key constraints...
        return knex.schema.dropTable('test_foreign_table_two');

      });

    });

  });

  describe('hasColumn', function() {

    it('checks whether a column exists, resolving with a boolean', function() {

      return knex.schema.hasColumn('accounts', 'first_name');

    });

  });

};