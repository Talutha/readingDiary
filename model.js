var bookshelf = require('./db');

var User = bookshelf.Model.extend({
  tableName: 'users',
  idAttribute: 'uid',
  posts: function() {
    return this.hasMany(Posts);
  },
  library: function() {
    return this.hasMany(Library, 'author_id');
  }
});

var Posts = bookshelf.Model.extend({
  tableName: 'entries',
  user: function() {
    return this.belongsTo(User);
  }
});

var Library = bookshelf.Model.extend({
  tableName: 'library',
  idAttribute: 'lid',
  user: function() {
    return this.belongsTo(User);
  },
  book: function() {
    return this.belongsTo(Book, 'bid');
  },
  books: function() {
    return this.hasMany(Book, 'bid');
  }
});

var Book = bookshelf.Model.extend({
  tableName: 'books',
  idAttribute: 'bid',
  hasTimestamps: true,
  library: function() {
    return this.hasMany(Library);
  },
  libraries: function() {
    return this.belongsToMany(Library, undefined, 'book_id');
  }
})

module.exports = {
  User: User,
  Posts: Posts,
  Library: Library,
  Book: Book
}
