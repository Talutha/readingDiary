exports.up = function(knex, Promise) {

  return Promise.all([

    knex.schema.raw("ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email)"),
    knex.schema.raw("ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username)")

  ])

};

exports.down = function(knex, Promise) {

  return Promise.all([
    knex.schema.raw("ALTER TABLE users DROP CONSTRAINT unique_email"),
    knex.schema.raw("ALTER TABLE users DROP CONSTRAINT unique_username")
  ])

};
