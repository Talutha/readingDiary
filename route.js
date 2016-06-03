var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var Model = require('./model');


var index = function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/signin');
  } else {

    var user2 = req.user;

    if(user2 !== undefined) {
      user2 = user2.toJSON();
    };
    res.render('index');
  };
};

var newBook = function(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  res.render('newbook');
}

var newBookPost = function(req, res, next) {
  var bookInfo = req.body;

  var bookPromise = new Model.Book({ isbn: bookInfo.isbn }).fetch();

  return bookPromise.then(function(model) {

    if(!model) {

      var addBook = new Model.Book({
        title: bookInfo.bookSearch,
        author: bookInfo.author,
        isbn: bookInfo.isbn,
        description: bookInfo.description,
        image: bookInfo.image
      });

      addBook.save().then(function(model) {
        res.render('newbook', {successMessage: 'Book added successfully.'})
      })

    } else {
      res.render('newbook', {errorMessage: 'A book with that ISBN already exists.'})
    }

  });

};

var updateBook = function(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  if(!req.params.isbn) res.redirect('/booklist');
  bookISBN = req.params.isbn
  updateBookPromise = new Model.Book({ isbn: bookISBN}).fetch();
  return updateBookPromise.then(function(model) {
    bookInfo = model.toJSON();
    res.render('updatebook', {bookInfo: bookInfo});
  });
};

var updateBookPost = function(req, res, next) {
  bookInfo = req.body;

  var updateBook = new Model.Book({
    title: bookInfo.bookSearch,
    bid: bookInfo.bookID,
    author: bookInfo.author,
    description: bookInfo.description,
    image: bookInfo.image
  });

  return updateBook.save().then(function(model) {
    var bookInfo = model.toJSON();
    res.render('updateBook', {bookInfo: bookInfo, successMessage: bookInfo.title + ' updated successfully'});
  });
};

// Checks to see if a user is already following a book
// Input User ID, Book ID
// Output Boolean
var isFollowingBook = function(uid, bid, callback) {
  var followPromise = new Model.Library({book_id: bid, author_id: uid}).fetch();

  return followPromise.then(function(model) {
    console.log(model);
    if(model) {
      console.log('Model returning TRUE');
      callback();
    } else {
      console.log('Model returning FALSE');
      callback();
    }
  });
};

// /follow/isbn
var followBook = function(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  if(!req.params.isbn) res.redirect('/booklist');

  var book = req.params.isbn;
  var bookIDPromise = new Model.Book({isbn: book}).fetch();
  var user = req.user.toJSON();

  return bookIDPromise.then(function(bookModel) {
    var bookInfo = bookModel.toJSON();
    console.log('Checking Book ' + bookInfo.bid + ' and user ' + user.uid + '.')
    isFollowingBook(user.uid, bookInfo.bid, function() {
      var followPromise = new Model.Library({
        book_id: bookInfo.bid,
        author_id: user.uid
      });
      return followPromise.save();
    });
    res.redirect('/booklist');
  });
};

var bookList = function(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  var user = req.user.toJSON();
  var bookListPromise = new Model.Book().fetchAll();
  var userLibraryPromise = Model.User.where({uid: user.uid}).fetch({withRelated: ['library']});
  userLibraryPromise.then(function(followList) {
    // console.log(JSON.stringify(followList.related('library')));
  });

  return bookListPromise.then(function(model) {
    var list = model.toJSON();
    userLibraryPromise.then(function(followList) {
      var following = followList.related('library').toJSON();
      var followingArray = [];
      for (var x=0; x < following.length; x++){
        followingArray.push(following[x]["book_id"]);
      };
      res.render('booklist', {list: list, following: followingArray});
    })
  });
};

var unfollowBook = function(req, res, next) {
  if(!req.isAuthenticated()) res.redirect('/signin');
  if(!req.params.isbn) res.redirect('/booklist');

  var book = req.params.isbn;
  var bookIDPromise = new Model.Book({isbn: book}).fetch();
  var user = req.user.toJSON();

  return bookIDPromise.then(function(bookModel) {
    var bookInfo = bookModel.toJSON();
    isFollowingBook(user.uid, bookInfo.bid, function() {
      var followPromise = new Model.Library({
        book_id: bookInfo.bid,
        author_id: user.uid
      }).fetch();
      // Returns error that followPromise.destroy is not a function
      // I may have to get the lid of the row I want deleted and destroy that instead
      return followPromise.destroy();
    });
    res.redirect('/booklist');
  });
}

var signIn = function(req, res, next) {
  if(req.isAuthenticated()) res.redirect('/');
  res.render('signin', {title: 'Sign In'});
};

var signInPost = function(req, res, next) {
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signin' },
    function(err, user, info) {
      if(err) {
        return res.render('signin', {title: 'Sign In', errorMessage: err.message});
      };

      if(!user) {
        return res.render('signin', {title: 'Sign In', errorMessage: info.message});
      };

      return req.logIn(user, function(err) {
        if(err) {
          return res.render('signin', {title: 'Sign In', errorMessage: err.message});
        } else {
          return res.redirect('/');
        };
      });

    })(req, res, next);
};

var register = function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  };
};

var registerPost = function(req, res, next) {
  var user = req.body;
  var usernamePromise = null;
  usernamePromise = new Model.User({ username: user.username }).fetch();

  return usernamePromise.then(function(model) {
    if(model) {
      res.render('register', { errorMessage: 'Username already exists'});
    } else {

      // Need
      // More
      // Password
      // Validation!

      var password = user.password;
      var hash = bcrypt.hashSync(password);

      var signUpUser = new Model.User({
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.emailAddress,
        username:   user.username,
        password:   hash,
        verified:   false
      });

      signUpUser.save().then(function(model) {
        // Sign in the newly registered user
        signInPost(req, res, next);
      });
    }
  });
};

var signOut = function(req, res, next) {
  if(!req.isAuthenticated()) {
    notFound404(req, res, next);
  } else {
    req.logout();
    res.redirect('/signin');
  }
};

var notFound404 = function(req, res, next) {
  res.status(404);
  res.render('404');
};

module.exports = {
  index: index,
  newBook: newBook,
  newBookPost: newBookPost,
  updateBook: updateBook,
  updateBookPost: updateBookPost,
  bookList: bookList,
  followBook: followBook,
  unfollowBook: unfollowBook,
  signIn: signIn,
  signInPost: signInPost,
  register: register,
  registerPost: registerPost,
  signOut: signOut,
  notFound404: notFound404
};
