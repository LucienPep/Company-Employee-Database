SELECT employee.id, employee.first_name, employee.last_name, main_role.title, department.department_name, main_role.salary, employee.manager_id
FROM employee
JOIN main_role ON employee.role_id = main_role.id
JOIN department ON main_role.department_id = department.id;


