const express = require('express');
const routes = express.Router();
const employee_controller = require('../controllers/employee_controller');
const role_controller = require('../controllers/role_controller');
const category_controller = require('../controllers/category_controller');

routes.get('/', async (req, res) => {

});

//- - - - - - - - - - Employees endpoints - - - - - - - - - -

//Отримати інформацію про усіх працівників, відсортованих за прізвищем
routes.get('/employees', employee_controller.getAll)

//Отримати інформацію про усіх працівників, що займають посаду касира, відсортованих за прізвищем
routes.get('/employees/cashiers', employee_controller.getAllCashiers)

//Додавати, редагувати, видаляти дані про працівників
routes.get('/employee/:id', employee_controller.getById)
routes.post('/employee/create', employee_controller.create)
routes.put('/employee/:id', employee_controller.update)
routes.delete('/employee/:id', employee_controller.deleteById)

//За прізвищем працівника знайти його телефон та адресу
routes.get('/employeeByNumberAndAdress', employee_controller.getByNumberAndAdress)



//- - - - - - - - - - Roles endpoints - - - - - - - - - -

//Додавати, редагувати, видаляти дані про ролі
routes.get('/roles', role_controller.getAll)
routes.get('/role/:id', role_controller.getById)
routes.post('/role/create', role_controller.create)
routes.put('/role/:id', role_controller.update)
routes.delete('/role/:id', role_controller.deleteById)



//- - - - - - - - - - Categories endpoints - - - - - - - - - -

//Отримати інформацію про усі категорії, відсортовані за назвою
routes.get('/categories', category_controller.getAll)

//Додавати, редагувати, видаляти дані про категорії товарів
routes.get('/category/:id', category_controller.getById)
routes.post('/category/create', category_controller.create)
routes.put('/category/:id', category_controller.update)
routes.delete('/category/:id', category_controller.deleteById)

module.exports = routes;
