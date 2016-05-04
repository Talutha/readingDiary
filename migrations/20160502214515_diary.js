exports.up = function(knex, Promise) {

  return Promise.all([

    knex.schema.createTable('users', function(table) {
      table.increments('uid').primary();
      table.string('username');
      table.string('firstName');
      table.string('lastName');
      table.string('email');
      table.string('password');
      table.date('joinDate');
      table.date('birthday');
      table.dateTime('lastSeen');
      table.boolean('verified');
    }),

    knex.schema.createTable('entries', function(table) {
      table.increments('id').primary();
      table.integer('author_id').references('uid').inTable('users');
      table.string('entry');
      table.integer('book_id');
      table.dateTime('postDate');
    })

  ])

};

exports.down = function(knex, Promise) {

  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('entries')
  ])

};
