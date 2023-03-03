const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const {printTable} = require('console-table-printer');

const password = require('./password')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function banner() {
  console.log(`
   ___________________________________________________________ 
  |      ____                                                 |
  |     / ___|___  _ __ ___  _ __   __ _ _ __  _   _          |
  |    | |   / _ \\| '_ ' _ \\| '_ \\ / _' | '_ \\| | | |         |
  |    | |__| (_) | | | | | | |_) | (_| | | | | |_| |         |
  |     \\____\\___/|_| |_| |_| .__/ \\__,_|_| |_|\\__, |         |
  |     _____               |_|                |___/          |
  |    | ____|_ __ ___  _ __ | | ___  _   _  ___  ___         |
  |    |  _| | '_ ' _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\        |
  |    | |___| | | | | | |_) | | (_) | |_| |  __/  __/        |
  |    |_____|_| |_|_|_| .__/|_|\\___/ \\__, |\\___|\\___|        |
  |     ____        _  |_|  | |       |___/                   |
  |    |  _ \\  __ _| |____ _| |__   ____ ___  ___             | 
  |    | | | |/ _' | __/ _' | '_ \\ / _' / __|/ _ \\            | 
  |    | |_| | (_| | || (_| | |_) | (_| \\__ \\  __/            |
  |    |____/ \\__,_|\\__\\__,_|_.__/ \\__,_|___/\\___|            |
  |___________________________________________________________|`) 
 pageStart()
}


function pageStart(){
  inquirer
  .prompt([
      {
          type: 'list',
          message: 'What would you like to do?',
          name: 'mainSelection',
          choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
      },
  ])
  .then((response) => {
      const choice = response.mainSelection

      switch (choice) {
          case 'View All Employees':
              viewEmployees()
              break
          case 'Add Employee':
              addEmployee()
              break
          case 'Update Employee Role':
              updateRole()
              break
          case 'View All Roles':
              viewRoles()
              break
          case 'Add Role':
              addRole()
              break
          case 'View All Departments':
              viewDepartment()
              break
          case 'Add Department':
              addDepartment()
              break
          case 'Quit':
            process.exit(1)
        }
  })
}

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: password,
    database: 'company_db'
  }
);
  
function viewEmployees() { 
  db.query('SELECT * FROM employee', (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });

}
function viewRoles() { 
  db.query(`SELECT main_role.id, main_role.title, main_role.salary, department.department_name
  FROM main_role
  JOIN department ON main_role.department_id = department.id;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });
}

function viewDepartment() { 
  db.query('SELECT * FROM department', (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });
}




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

banner()