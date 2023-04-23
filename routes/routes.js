const express = require('express');
const routes = express.Router();
const employee_controller = require('../controllers/employee_controller');
const role_controller = require('../controllers/role_controller');
const category_controller = require('../controllers/category_controller');
const product_controller = require('../controllers/product_controller');
const customer_controller = require('../controllers/customer_controller');
const auth_controller = require('../controllers/auth_controller');

const API_ROOT = '/zlagoda/api'

//- - - - - - - - - - Employees endpoints - - - - - - - - - -

//Отримати інформацію про усіх працівників, відсортованих за прізвищем
routes.get(API_ROOT + '/employees', auth_controller.authorizeManager, employee_controller.getAll)

//Отримати інформацію про усіх працівників, що обіймають посаду касира, відсортованих за прізвищем
routes.get('/employees/cashiers', employee_controller.getAllCashiers)

//Додавати, редагувати, видаляти дані про працівників
routes.get('/employee/:id', employee_controller.getById)
routes.post('/employee/create', employee_controller.create)
routes.put('/employee/update/:id', employee_controller.update)
routes.delete('/employee/delete/:id', employee_controller.deleteById)

//За прізвищем працівника знайти його телефон та адресу
routes.get('/employeeNumberAndAddress', employee_controller.getNumberAndAddress)


//- - - - - - - - - - Roles endpoints - - - - - - - - - -

//Додавати, редагувати, видаляти дані про ролі
routes.get('/roles', role_controller.getAll)
routes.get('/role/:id', role_controller.getById)


//- - - - - - - - - - Categories endpoints - - - - - - - - - -

//Отримати інформацію про усі категорії, відсортовані за назвою
routes.get('/categories', category_controller.getAll)

//Додавати, редагувати, видаляти дані про категорії товарів
routes.get('/category/:id', category_controller.getById)
routes.post('/category/create', category_controller.create)
routes.put('/category/update/:id', category_controller.update)
routes.delete('/category/delete/:id', category_controller.deleteById)


//- - - - - - - - - - Product endpoints - - - - - - - - - -

//Отримати інформацію про усі товари, відсортовані за назвою
routes.get('/products', product_controller.getAll)

//Здійснити пошук усіх товарів, що належать певній категорії, відсортованих за назвою
routes.get('/productsByCategory', product_controller.getAllByCategory)

//Здійснити пошук товарів за назвою
routes.get('/productsByName', product_controller.getByName)

//Додавати, редагувати, видаляти дані про товари
routes.get('/product/:id', product_controller.getById)
routes.post('/product/create', product_controller.create)
routes.put('/product/update/:id', product_controller.update)
routes.delete('/product/delete/:id', product_controller.deleteById)


//- - - - - - - - - - Customer card endpoints - - - - - - - - - -

//Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
routes.get('/customers', customer_controller.getAll)

//Отримати інформацію про усіх постійних клієнтів, що мають карту клієнта із певним відсотком, посортованих за прізвищем
routes.get('/customersByPercent', customer_controller.getAllByPercent)

//Отримати інформацію про усіх постійних клієнтів, що мають карту клієнта із певним відсотком, посортованих за прізвищем
routes.get('/customerBySurname', customer_controller.getBySurname)

//Додавати, редагувати, видаляти дані про товари
routes.get('/customer/:card_number', customer_controller.getById)
routes.post('/customer/create', customer_controller.create)
routes.put('/customer/update/:card_number', customer_controller.update)
routes.delete('/api/customer/delete/:card_number', customer_controller.deleteById)

routes.post('/authenticate', auth_controller.authenticate);
routes.post('/register', auth_controller.register);

module.exports = routes;
