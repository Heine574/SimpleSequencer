const mysql = require('mysql2');
const PASSWORD = require('./config').password;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: PASSWORD,
  database: 'sequencer',
});

const writeSequence = (seq, author, title) => {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO sequences (seq, author, title) VALUES (?, ?, ?);', [seq, author, title], (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

const readSequence = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM sequences WHERE id = ?;', [id], (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          reject(`No seqence found matching id '${id}'`);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

const getAll = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM sequences;', (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          reject('No sequences in database');
        } else {
          resolve(results);
        }
      }
    });
  });
};

module.exports = {
  writeSequence,
  readSequence,
  getAll,
};
