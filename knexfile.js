module.exports = {
  development: {
    client: 'pg',
    connection: {
      user: 'postgres',
      database: 'reading_diary',
      password: process.argv[2]
    }
  }
};
