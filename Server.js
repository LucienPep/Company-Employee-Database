//bring in needed packages
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const {printTable} = require('console-table-printer');

//hidden password on another js file I have placed in the ignore file
const password = require('./password')

const app = express();
//selects prefered port or 3001
const PORT = process.env.PORT || 3001;
//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var IDLength = 0

//creates sql connection
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: password,
    database: 'company_db'
  }
);

//ascII banner for app start
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

//starting function to ask user what they would like to do using inquirer
function pageStart(){
  inquirer
  .prompt([
      {
          type: 'list',
          message: 'What would you like to do?',
          name: 'mainSelection',
          choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Add Employee', 'Add Role', 'Add Department', 'Update Employee Role', 'Update Employee Manager', 'View Employees by Manager', 'View Employees by Department', 'Delete Employee', 'Delete Role', 'Delete Department', 'Find Total Budget of Department', 'Quit']
      },
  ]).then((response) => {
      const choice = response.mainSelection
//selection to run needed function
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
          case 'Update Employee Manager':
              updateManager()
              break
          case 'View Employees by Manager':
              viewEmployeesByManager()
              break
          case 'View Employees by Department':
              viewEmployeesByDepartment()
              break
          case 'Delete Department':
              deleteDepartment()
              break
          case 'Delete Employee':
              deleteEmployee()
              break
          case 'Delete Role':
              deleteRole()
              break
          case 'Find Total Budget of Department':
              totalBudget()
              break
          case 'Quit':
            process.exit(1)
        }
  })
}

//view employee list function
function viewEmployees() { 
  db.query(`SELECT e.id, e.first_name, e.last_name, main_role.title, department.department_name, main_role.salary, CONCAT (m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN main_role ON e.role_id = main_role.id
  JOIN department ON main_role.department_id = department.id
  LEFT JOIN employee m ON e.manager_id = m.id
  ORDER BY e.id ASC;
  `, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });

}
//view roles list function
function viewRoles() { 
  db.query(`SELECT main_role.id, main_role.title, department.department_name AS department, main_role.salary
  FROM main_role
  JOIN department ON main_role.department_id = department.id
  ORDER BY main_role.id ASC;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });
}
//view department list function
function viewDepartment() { 
  db.query(`SELECT * FROM department
  ORDER BY department.id ASC;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    printTable(data)
    pageStart()
  });
}

//function to add employee starts by collecting data for prompt
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
    //query for manager selection
    db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      var employeeArray = ['null']
      for(i = 0; i < data.length; i++){
        employeeArray.push(data[i].employee_name)
      }
      //run next function with collected data
      addEmployeeTwo(roleArray, employeeArray)
    })
  })
}

//run inquirer prompt using data collected
function addEmployeeTwo(role, emp){ 
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
      //selects id from string selection for employee parameter
      db.query(`SELECT id FROM main_role WHERE title = '${response.role}'`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }
        const roleID = data[0].id

        if(response.manager == 'null'){
          const empID = null
          addEmployeeThree(response.firstName, response.lastName, roleID, empID)
        }else{

        var managerArray = []
        managerArray.push(response.manager.split(" "))
        //selects id for manager selected
        db.query(`SELECT id FROM employee WHERE first_name = '${managerArray[0][0]}' AND last_name = '${managerArray[0][1]}'`, (err, data) => {
          if (err) {
            console.log(err)
            return;
          }
          const empID = data[0].id
          //run final function with collected data
          addEmployeeThree(response.firstName, response.lastName, roleID, empID)
        })
      }
      })
    })
}
//create new employee using data
function addEmployeeThree(first, last, role, emp){
  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES ('${first}', '${last}', ${role}, ${emp})` 
  )
  pageStart()
}

//first function to add department asks user for name ain inputs to database
function addDepartment(){
  inquirer
  .prompt([
      {
          type: 'input',
          message: 'What is the name of the department?',
          name: 'departmentName',
      },
    ]).then((response) => {
      db.query(`INSERT INTO department (department_name)
            VALUES ('${response.departmentName}')` 
            )
            pageStart()
    })
}

//add role collects data for inquirer prompt
function addRole(){
  db.query(`SELECT department.department_name FROM department`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var depArray = []
    for(i = 0; i < data.length; i++){
      depArray.push(data[i].department_name)
    }
    addRoleTwo(depArray)
  })
}
//function to run prompt to add new role
function addRoleTwo(dep){
  inquirer
  .prompt([
      {
          type: 'input',
          message: 'What is the name of the role?',
          name: 'roleName',
      },
      {
        type: 'input',
        message: 'What is the salary of the role?',
        name: 'roleSalary',
    },
    {
      type: 'list',
      message: 'What department does the role belong to?',
      name: 'departmentName',
      choices: dep,
  },
  ]).then((response) => {
    //gets id from selected department
    db.query(`SELECT id FROM department WHERE department_name = '${response.departmentName}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      //adds new role to database
      db.query(`INSERT INTO main_role (title, salary, department_id)
            VALUES ('${response.roleName}', ${response.roleSalary}, ${data[0].id})` 
            )
            pageStart()
    })
  })
}
//for updating role collects data from prompt 
function updateRole(){
  db.query(`SELECT main_role.title FROM main_role`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var role2Array = []
    for(i = 0; i < data.length; i++){
      role2Array.push(data[i].title)
    }
    
    db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      
      var employee2Array = []
      for(i = 0; i < data.length; i++){
        employee2Array.push(data[i].employee_name)
      }
      updateRoleTwo(role2Array, employee2Array,)
    })
  })
}
//prompt for role update
function updateRoleTwo(role2, emp2){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Which employee's role do you wish to update?",
          name: 'employeeSelected',
          choices: emp2,
      },
      {
          type: 'list',
          message: 'Which role to you wish to assign the selected employee?',
          name: 'roleSelected',
          choices: role2,
      },
  ]).then((response) => {
    //selects id from main role and employee selected
    db.query(`SELECT id FROM main_role WHERE title = '${response.roleSelected}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      const role2ID = data[0].id

      var employeeArray = []
      employeeArray.push(response.employeeSelected.split(" "))

      db.query(`SELECT id FROM employee WHERE first_name = '${employeeArray[0][0]}' AND last_name = '${employeeArray[0][1]}'`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }
        const emp2ID = data[0].id
        //updates employee role id
        db.query(`UPDATE employee SET role_id = ${role2ID} WHERE id = ${emp2ID}`)
        pageStart()
      })
    })
  })
}
// update manager gets employee names and combines them for prompt
function updateManager(){
   db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var employee3Array = []
    for(i = 0; i < data.length; i++){
      employee3Array.push(data[i].employee_name)
    }
    updateManagerTwo(employee3Array)
  })
}
//prompt for manager updating
function updateManagerTwo(emp3){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Which employee's manager do you wish to update?",
          name: 'employeeSelected',
          choices: emp3,
      },
      {
          type: 'list',
          message: 'Which manager to you wish to assign the selected employee?',
          name: 'managerSelected',
          choices: emp3,
      },
  ]).then((response) => {
      //declare arrays and pushes inputed data and collects id from employee for user and manager
      var employeeArray = []
      employeeArray.push(response.employeeSelected.split(" "))

      var managerArray = []
      managerArray.push(response.managerSelected.split(" "))

      db.query(`SELECT id FROM employee WHERE first_name = '${employeeArray[0][0]}' AND last_name = '${employeeArray[0][1]}'`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }
        const emp3ID = data[0].id
        
        db.query(`SELECT id FROM employee WHERE first_name = '${managerArray[0][0]}' AND last_name = '${managerArray[0][1]}'`, (err, data) => {
          if (err) {
            console.log(err)
            return;
          }
          const manID = data[0].id
          //updates employees manager id with newly selected one 
          db.query(`UPDATE employee SET manager_id = ${manID} WHERE id = ${emp3ID}`)
          pageStart()
        })
      })
    })
}
//view employees by manager gets data for employee names to select
function viewEmployeesByManager(){
  db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var employee3Array = []
    for(i = 0; i < data.length; i++){
      employee3Array.push(data[i].employee_name)
    }
    viewEmployeesByManagerTwo(employee3Array)
  })
}
//prompt to ask which manager you wish to view employees
function viewEmployeesByManagerTwo(emp4){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select manager to view employees",
          name: 'managerSelected',
          choices: emp4,
      },
  ]).then((response) => {
    // selects manager selected and selects employees where manager id is true
    var manager2Array = []
      manager2Array.push(response.managerSelected.split(" "))

    db.query(`SELECT id FROM employee WHERE first_name = '${manager2Array[0][0]}' AND last_name = '${manager2Array[0][1]}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      const man2ID = data[0].id

      db.query(`SELECT id FROM employee WHERE manager_id = ${man2ID}`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }
        var returnData = []
        var managerArray = []
        var stopLength = data.length
        for(i = 0; i < data.length; i++){
          managerArray.push(data[i].id)
        //shows table showing all employees where manager id is true
        db.query(`SELECT e.id, e.first_name, e.last_name, main_role.title,    department.department_name, main_role.salary, CONCAT (m.first_name, ' ',  m.last_name) AS manager
          FROM employee e
          JOIN main_role ON e.role_id = main_role.id
          JOIN department ON main_role.department_id = department.id
          LEFT JOIN employee m ON e.manager_id = m.id
          WHERE e.id = ${managerArray[i]}
          ORDER BY e.id ASC
          `, (err, data) => {
            if (err) {
            console.log(err)
            return;
            }
            returnData.push(data[0])
            if(returnData.length == stopLength){
              printTable(returnData)
              pageStart()
            }
          })
        }
      })
    })
  })
}
//view employees by department similar to last function, collects department name for prompt
function viewEmployeesByDepartment(){
  db.query(`SELECT department_name FROM department;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    var departmentArray = []
    for(i = 0; i < data.length; i++){
      departmentArray.push(data[i].department_name)
    }
    viewEmployeesByDepartmentTwo(departmentArray)
  });
}
//asks which department user wants to see employees
function viewEmployeesByDepartmentTwo(data){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select department to view employees",
          name: 'departmentSelected',
          choices: data,
      },
  ]).then((response) => {
    //selects id for department then id for role where department id is true then id on employee where role id is true
    db.query(`SELECT id FROM department WHERE department_name = '${response.departmentSelected}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      db.query(`SELECT id FROM main_role WHERE department_id = ${data[0].id}`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        } 

        var roleArrayOne = []
        var return3Data = []
        var roleLength = data.length

        for(i = 0; i < data.length; i++){
          roleArrayOne.push(data[i].id)
        
        db.query(`SELECT id FROM employee WHERE role_id = ${roleArrayOne[i]}`, (err, data) => {
            if (err) {
            console.log(err)
            return;
            }
            
            return3Data.push(data)
            if(return3Data.length == roleLength){
              var array1 = return3Data[0]
              var array2 = return3Data[1]
              var finalArray = array1.concat(array2)

              viewEmployeesByDepartmentThree(finalArray)
            }
          })
        } 
      })
    })
  })
}
//final data inputed into function and prints all employees found in department into new table 
function viewEmployeesByDepartmentThree(data){
  var stopLength2 = data.length
  var return2Data = []
  var roleArray = []
  for(i = 0; i < data.length; i++){
    roleArray.push(data[i].id)

    db.query(`SELECT e.id, e.first_name, e.last_name, main_role.title,    department.department_name, main_role.salary, CONCAT (m.first_name, ' ',  m.last_name) AS manager
    FROM employee e
    JOIN main_role ON e.role_id = main_role.id
    JOIN department ON main_role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id
    WHERE e.id = ${roleArray[i]}
    ORDER BY e.id ASC
    `, (err, data) => {
      if (err) {
      console.log(err)
      return;
      }
      return2Data.push(data[0])
      if(return2Data.length == stopLength2){
        printTable(return2Data)
        pageStart()
      }
    })
  }
}
//shows a list of departments and deletes selected using prompt
function deleteDepartment(){
  db.query(`SELECT department_name FROM department;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    var departmentArray = []
    for(i = 0; i < data.length; i++){
      departmentArray.push(data[i].department_name)
    }
    deleteDepartmentTwo(departmentArray)
  });
}
//prompt for user to select department
function deleteDepartmentTwo(data){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select department to delete",
          name: 'departmentSelected',
          choices: data,
      },
  ]).then((response) => {
    //delete selected department
    console.log(response.departmentSelected)
    db.query(`DELETE FROM department WHERE department_name = '${response.departmentSelected}'`)
    pageStart()    
  })
}
//gets role names for prompt
function deleteRole() {
  db.query(`SELECT main_role.title FROM main_role`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var role2Array = []
    for(i = 0; i < data.length; i++){
      role2Array.push(data[i].title)
    }
    deleteRoleTwo(role2Array)
  })
}
//asks user which role is to be deleted
function deleteRoleTwo(data) {
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select role to delete",
          name: 'roleSelected',
          choices: data,
      },
  ]).then((response) => {
    //selects id and deletes role where id is true
    db.query(`SELECT id FROM main_role WHERE title = '${response.roleSelected}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      db.query(`DELETE FROM main_role WHERE id = ${data[0].id}`)
      pageStart()
    })
  })
}
//gets employee name data an combines for prompt
function deleteEmployee(){
  db.query(`SELECT CONCAT (employee.first_name, ' ', employee.last_name) AS employee_name FROM employee`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    
    var employee3Array = []
    for(i = 0; i < data.length; i++){
      employee3Array.push(data[i].employee_name)
    }
    deleteEmployeeTwo(employee3Array)
  })
}
//prompt for user selection
function deleteEmployeeTwo(data) {
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select employee to delete",
          name: 'employeeSelected',
          choices: data,
      },
  ]).then((response) => {
    //select id and delete employee where id is true
    var employee2Array = []
    employee2Array.push(response.employeeSelected.split(" "))

    db.query(`SELECT id FROM employee WHERE first_name = '${employee2Array[0][0]}' AND last_name = '${employee2Array[0][1]}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }

      db.query(`DELETE FROM employee WHERE id = ${data[0].id}`)
      pageStart()

    })
  })
}
//gets department names for prompt
function totalBudget() {
  db.query(`SELECT department_name FROM department;`, (err, data) => {
    if (err) {
      console.log(err)
      return;
    }
    var departmentArray = []
    for(i = 0; i < data.length; i++){
      departmentArray.push(data[i].department_name)
    }
    totalBudgetTwo(departmentArray)
  });
}
//prompt to select which department
function totalBudgetTwo(data){
  inquirer
  .prompt([
      {
          type: 'list',
          message: "Select department to view total utilised budget",
          name: 'departmentSelected',
          choices: data,
      },
  ]).then( (response) => {
    //gets id from department then id from main role where department id is true then employee id where any role id is true
    db.query(`SELECT id FROM department WHERE department_name = '${response.departmentSelected}'`, (err, data) => {
      if (err) {
        console.log(err)
        return;
      }
      
      db.query(`SELECT id FROM main_role WHERE department_id = ${data[0].id}`, (err, data) => {
        if (err) {
          console.log(err)
          return;
        }

       
          db.query(`SELECT id FROM employee WHERE role_id = ${data[0].id} OR role_id = ${data[1].id}`, (err, data) => {
            if (err) {
            console.log(err)
            return;
            }  
            totalBudgetThree(data)   
          })  
      })
    })  
  })
}
//collects totals of employee salary roles from main roles where id is true
function totalBudgetThree(data) {
  employee4Array = []
  SalaryArray = []
  IDLength = data.length

  for(i = 0; data.length > i; i++){
    employee4Array.push(data[i].id)
  }
  
  for(i = 0; data.length > i; i++){
    db.query(`SELECT role_id FROM employee WHERE id = ${employee4Array[i]}`, (err, data) => {
      if (err) {
      console.log(err)
      return;
      }
      db.query(`SELECT salary FROM main_role WHERE id = ${data[0].role_id}`, (err, data) => {
        if (err) {
        console.log(err)
        return;
        }
        
        SalaryArray.push(data[0].salary)

        totalBudgetFour(SalaryArray)
      })
    })
  }
}
//collects total of all employees salaries within department and adds them together and logs them to console
function totalBudgetFour(data){
  if (data.length === IDLength){
    finalSalaryArray = []
    
    for(i = 0; data.length > i; i++){
      finalSalaryArray.push(parseInt(data[i]))
    }
    
    const sum = finalSalaryArray.reduce((runningTotal, employeeValue) => runningTotal + employeeValue, 0)

    console.log('\n Total cost of department = $' + sum + '\n')
    pageStart()
  }
}

//port listener 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

//starting function
banner()