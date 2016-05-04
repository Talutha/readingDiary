var config = require('./knexfile.js');
var env = 'development';
var knex = require('knex')(config[env]);

module.exports = require('bookshelf')(knex);

knex.migrate.latest([config])
