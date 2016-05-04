var bookshelf = require('./db');

var User = bookshelf.Model.extend({
  tableName: 'users',
  idAttribute: 'uid',
  posts: function() {
    return this.hasMany(Posts);
  }
});

var Posts = bookshelf.Model.extend({
  tableName: 'entries'
});

module.exports = {
  User: User,
  Posts: Posts
}
