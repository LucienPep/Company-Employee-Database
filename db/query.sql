SELECT e.id, e.first_name, e.last_name, main_role.title, department.department_name, main_role.salary, CONCAT (m.first_name, ' ', m.last_name) AS manager
FROM employee e
JOIN main_role ON e.role_id = main_role.id
JOIN department ON main_role.department_id = department.id
LEFT JOIN employee m ON e.manager_id = m.id;
