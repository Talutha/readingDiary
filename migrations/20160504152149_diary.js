
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTable('books', function(table) {
      table.increments('bid').primary();
      table.string('title');
      table.string('author');
      table.string('isbn').unique();
      table.text('description');
      table.string('image');
      table.timestamps();
    }),

    knex.schema.createTable('library', function(table) {
      table.increments('lid').primary();
      table.integer('book_id').references('bid').inTable('books');
      table.integer('author_id').references('uid').inTable('users');
    })

  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.dropTable('library'),
    knex.schema.dropTable('books'),

  ])
};
