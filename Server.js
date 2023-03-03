const express = require('express');
const mysql = require('mysql2');

const password = require('./password')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: password,
    database: 'movies_db'
  },
  console.log(`Connected to the movies_db database.`)
);





app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });