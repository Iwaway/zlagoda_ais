const express = require('express');
const routes = express.Router();
const employee = require('../controllers/employee_controller');
const role = require('../controllers/role_controller');
const category = require('../controllers/category_controller');
const product = require('../controllers/product_controller');
const store_product = require('../controllers/store_product_controller');
const customer = require('../controllers/customer_controller');
const auth = require('../controllers/auth_controller');
const receipt = require('../controllers/receipt_controller');
const sale = require('../controllers/sale_controller');
const query = require('../controllers/query_controller');

const API_ROOT = '/zlagoda/api'

//- - - - - - - - - - Employees endpoints - - - - - - - - - -

//Отримати інформацію про усіх працівників, відсортованих за прізвищем
routes.get(API_ROOT + '/employees', auth.authorizeManager, employee.getAll)

//Отримати інформацію про усіх працівників, що обіймають посаду касира, відсортованих за прізвищем
routes.get(API_ROOT + '/employees/cashiers', employee.getAllCashiers)

//Додавати, редагувати, видаляти дані про працівників
routes.get(API_ROOT + '/employees/:id_employee', auth.authorizeManagerOrCashierPersonal, employee.getById)
routes.post(API_ROOT + '/employees/create', auth.authorizeManager, employee.create)
routes.put(API_ROOT + '/employees/update/:id_employee', auth.authorizeManager, employee.update)
routes.delete(API_ROOT + '/employees/delete/:id_employee', auth.authorizeManager, employee.deleteById)

//За прізвищем працівника знайти його телефон та адресу
routes.post(API_ROOT + '/employees/searchBySurname/', auth.authorizeManager, employee.searchBySurname)


//- - - - - - - - - - Roles endpoints - - - - - - - - - -

//Переглядати дані про ролі
routes.get(API_ROOT + '/roles', role.getAll)
routes.get(API_ROOT + '/roles/:id', role.getById)


//- - - - - - - - - - Categories endpoints - - - - - - - - - -

//Отримати інформацію про усі категорії, відсортовані за назвою
routes.get(API_ROOT + '/categories', auth.authorizeCashierOrManager, category.getAll)

//Додавати, редагувати, видаляти дані про категорії товарів
routes.get(API_ROOT + '/categories/:category_number', auth.authorizeCashierOrManager, category.getById)
routes.post(API_ROOT + '/categories/create', auth.authorizeManager, category.create)
routes.put(API_ROOT + '/categories/update/:category_number', auth.authorizeManager, category.update)
routes.delete(API_ROOT + '/categories/delete/:category_number', auth.authorizeManager, category.deleteById)


//- - - - - - - - - - Product endpoints - - - - - - - - - -

//Отримати інформацію про усі товари, відсортовані за назвою
routes.get(API_ROOT + '/products', auth.authorizeCashierOrManager, product.getAll)
routes.get(API_ROOT + '/products/unregistered', auth.authorizeManager, product.getUnregistered)
routes.get(API_ROOT + '/products/registered', auth.authorizeManager, product.getRegistered)

//Здійснити пошук усіх товарів, що належать певній категорії, відсортованих за назвою
routes.get(API_ROOT + '/products/category/:categoryNumber', auth.authorizeCashierOrManager, product.getAllByCategory)

//Здійснити пошук товарів за назвою
routes.post(API_ROOT + '/products/searchByName', auth.authorizeCashierOrManager, product.getByName)

//Додавати, редагувати, видаляти дані про товари
routes.get(API_ROOT + '/products/:id_product', auth.authorizeCashierOrManager, product.getById)
routes.post(API_ROOT + '/products/create', auth.authorizeManager, product.create)
routes.put(API_ROOT + '/products/update/:id_product', auth.authorizeManager, product.update)
routes.delete(API_ROOT + '/products/delete/:id_product', auth.authorizeManager, product.deleteById)


//- - - - - - - - - - Customer card endpoints - - - - - - - - - -

//Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
routes.get(API_ROOT + '/customers', auth.authorizeCashierOrManager, customer.getAll)

//Отримати інформацію про усіх постійних клієнтів, що мають карту клієнта із певним відсотком, посортованих за прізвищем
routes.post(API_ROOT + '/customers/searchByPercentage', auth.authorizeManager, customer.searchByPercent)

//Отримати інформацію про усіх постійних клієнтів за прізвищем
routes.post(API_ROOT + '/customers/searchBySurname', auth.authorizeCashier, customer.searchBySurname)

//Додавати, редагувати, видаляти дані про товари
routes.get(API_ROOT + '/customers/:cardNumber', auth.authorizeCashierOrManager, customer.getById)
routes.post(API_ROOT + '/customers/create', auth.authorizeManager, customer.create)
routes.put(API_ROOT + '/customers/update/:cardNumber', auth.authorizeCashierOrManager, customer.update)
routes.delete(API_ROOT + '/customers/delete/:cardNumber', auth.authorizeManager, customer.deleteById)

//- - - - - - - - - - Products in storage endpoints - - - - - - - - - -

//Отримати інформацію про усі товари в магазині, відсортовані за назвою
routes.get(API_ROOT + '/storeProductsSortedByName', auth.authorizeCashierOrManager, store_product.getAllNames)

//Отримати інформацію про усі акційні товари, відсортовані за кількістю одиниць товару
routes.get(API_ROOT + '/storeProducts/promotion', auth.authorizeCashierOrManager, store_product.getAllProm)

//Отримати інформацію про усі неакційні товари, відсортовані за кількістю одиниць товару
routes.get(API_ROOT + '/storeProducts/nonPromotion', auth.authorizeCashierOrManager, store_product.getAllNonProm)

//Отримати інформацію про усі товари в магазині, відсортовані за кількістю
routes.get(API_ROOT + '/storeProducts', auth.authorizeCashierOrManager, store_product.getAll)
routes.post(API_ROOT + '/storeProducts/searchByName', auth.authorizeCashierOrManager, store_product.searchByName)

//Додавати, редагувати, видаляти дані про товари у магазині
routes.post(API_ROOT + '/storeProducts/create', auth.authorizeManager, store_product.create)
routes.post(API_ROOT + '/storeProducts/registerReception', auth.authorizeManager, store_product.registerReception)
routes.post(API_ROOT + '/storeProducts/putOnPromotion/:upc', auth.authorizeManager, store_product.putOnPromotion)
routes.put(API_ROOT + '/storeProducts/update/:upc', auth.authorizeManager, store_product.update)
routes.delete(API_ROOT + '/storeProducts/delete/:upc', auth.authorizeManager, store_product.deleteById)
routes.get(API_ROOT + '/storeProducts/:upc', auth.authorizeManager, store_product.getByIdAll)


//- - - - - - - - - - Receipts endpoints - - - - - - - - - -



//Отримати інформацію про усі чеки, створені усіма касирами за певний період часу
routes.post(API_ROOT + '/receipts/', auth.addIdToBody, auth.authorizeManagerOrCashierPersonal, receipt.getAllByPeriod)

//Здійснювати продаж товарів (додавання чеків)
routes.post(API_ROOT + '/receipts/create', auth.authorizeCashier, receipt.create)

//Визначити загальну суму проданих товарів з чеків, створених певним касиром за певний період часу
routes.post(API_ROOT + '/receipts/sumByCashier/:id_employee', auth.authorizeManagerOrCashierPersonal, receipt.getSumByCashier)

//Визначити загальну суму проданих товарів з чеків, створених усіма касиром за певний період часу
routes.post(API_ROOT + '/receipts/sumByPeriod/', auth.authorizeManager, receipt.getSumByPeriod)

//Переглянути список усіх чеків, що створив касир за цей день;
// !!!!!!!!!!!!!!!!
routes.get(API_ROOT + '/receipts/today/cashiers/:id_employee', auth.authorizeManagerOrCashierPersonal, receipt.getSumByPeriod)

//Визначити загальну кількість одиниць певного товару, проданого за певний період часу
routes.post(API_ROOT + '/receipts/ofPeriod/products/:product_id', auth.authorizeManager, receipt.getCountByPeriod)

//Отримати інформацію про усі чеки, створені певним касиром за певний період часу
routes.post(API_ROOT + '/receipts/ofPeriod/cashiers/:id_employee', auth.authorizeManagerOrCashierPersonal, receipt.getAllByCashier)

//За номером чеку вивести усю інформацію про даний чек
routes.post(API_ROOT + '/receipts/:receipt_number', auth.authorizeCashier, receipt.getById)

//- - - - - - - - - - Authentication endpoints - - - - - - - - - -

routes.post(API_ROOT + '/authenticate', auth.authenticate);
routes.post(API_ROOT + '/register', auth.register);

//- - - - - - - - - - Queries endpoints - - - - - - - - - -

routes.get(API_ROOT + '/getCountByReceipt', query.getCountGroupingByReceipt)
routes.get(API_ROOT + '/getLessByNumber/:number', query.getLessByNumber)
routes.get(API_ROOT + '/getCountAndSumByCustomer', query.getCountAndSumByCustomer)
routes.get(API_ROOT + '/getCustomersForPromotion', query.getCustomersForPromotion)

module.exports = routes;

//Manager
// 4. Видруковувати звіти з інформацією про усіх працівників, постійних клієнтів,
// категорії товарів, товари, товари у магазині, чеки;
