const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const {printTable} = require('console-table-printer');

const password = require('./password')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var roles = ''

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
  db.query(`SELECT e.id, e.first_name, e.last_name, main_role.title, department.department_name, main_role.salary, CONCAT (m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN main_role ON e.role_id = main_role.id
  JOIN department ON main_role.department_id = department.id
  LEFT JOIN employee m ON e.manager_id = m.id;
  `, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });

}
function viewRoles() { 
  db.query(`SELECT main_role.id, main_role.title, department.department_name AS department, main_role.salary
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

function addEmployee() {
  db.query(`SELECT main_role.title FROM main_role`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var roleArray = []
    for(i = 0; i < data.length; i++){
      roleArray.push(data[i].title)
    }
    
    db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      var employeeLength = data.length + 1
      var employeeArray = ['null']
      for(i = 0; i < data.length; i++){
        employeeArray.push(data[i].employee_name)
      }
      addEmployeeTwo(roleArray, employeeArray, employeeLength)
    })
  })
}

function addEmployeeTwo(role, emp, len){ 
    inquirer
    .prompt([
        {
            type: 'input',
            message: 'First Name',
            name: 'firstName',
        },
        {
            type: 'input',
            message: 'Last Name',
            name: 'lastName',
        },
        {
            type: 'list',
            message: 'Role',
            name: 'role',
            choices: role,
        },
        {
            type: 'list',
            message: 'Manager',
            name: 'manager',
            choices: emp,
        },
    ])
    .then((response) => {
      db.query(`SELECT id FROM main_role WHERE title = '${response.role}'`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }
        const roleID = data[0].id

        var managerArray = []
        managerArray.push(response.manager.split(" "))

        db.query(`SELECT id FROM employee WHERE first_name = '${managerArray[0][0]}' AND last_name = '${managerArray[0][1]}'`, (err, data) => {
          if (err) {
            console.log(err)
            return;
          }
          const empID = data[0].id
      
          db.query(`INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
            VALUES (${len}, '${response.firstName}', '${response.lastName}', ${roleID}, ${empID})` 
            )
            pageStart()
        })
      })
    })
}




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

banner()