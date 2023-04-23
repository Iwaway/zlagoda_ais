const express = require('express');
const routes = express.Router();
const employee = require('../controllers/employee_controller');
const role = require('../controllers/role_controller');
const category = require('../controllers/category_controller');
const product = require('../controllers/product_controller');
const store_product = require('../controllers/store_product_controller');
const customer = require('../controllers/customer_controller');
const auth = require('../controllers/auth_controller');

const API_ROOT = '/zlagoda/api'

//- - - - - - - - - - Employees endpoints - - - - - - - - - -

//Отримати інформацію про усіх працівників, відсортованих за прізвищем
routes.get(API_ROOT + '/employees', auth.authorizeManager, employee.getAll)

//Отримати інформацію про усіх працівників, що обіймають посаду касира, відсортованих за прізвищем
routes.get('/employees/cashiers', employee.getAllCashiers)

//Додавати, редагувати, видаляти дані про працівників
routes.get('/employee/:id_employee', auth.authorizeManager, employee.getById)
routes.post('/employee/create', auth.authorizeManager, employee.create)
routes.put('/employee/update/:id_employee', auth.authorizeManager, employee.update)
routes.delete('/employee/delete/:id_employee', auth.authorizeManager, employee.deleteById)

//За прізвищем працівника знайти його телефон та адресу
routes.get('/employeeNumberAndAddress', auth.authorizeManager, employee.getNumberAndAddress)


//- - - - - - - - - - Roles endpoints - - - - - - - - - -

//Переглядати дані про ролі
routes.get('/roles', role.getAll)
routes.get('/role/:role_id', role.getById)


//- - - - - - - - - - Categories endpoints - - - - - - - - - -

//Отримати інформацію про усі категорії, відсортовані за назвою
routes.get('/categories', auth.authorizeManager, category.getAll)

//Додавати, редагувати, видаляти дані про категорії товарів
routes.get('/category/:category_number', auth.authorizeManager, category.getById)
routes.post('/category/create', auth.authorizeManager, category.create)
routes.put('/category/update/:category_number', auth.authorizeManager, category.update)
routes.delete('/category/delete/:category_number', auth.authorizeManager, category.deleteById)


//- - - - - - - - - - Product endpoints - - - - - - - - - -

//Отримати інформацію про усі товари, відсортовані за назвою
routes.get('/products', auth.authorizeCashierOrManager, product.getAll)

//Здійснити пошук усіх товарів, що належать певній категорії, відсортованих за назвою
routes.get('/productsByCategory', auth.authorizeCashierOrManager, product.getAllByCategory)

//Здійснити пошук товарів за назвою
routes.get('/productsByName', auth.authorizeCashier, product.getByName)

//Додавати, редагувати, видаляти дані про товари
routes.get('/product/:id_product', auth.authorizeManager, product.getById)
routes.post('/product/create', auth.authorizeManager, product.create)
routes.put('/product/update/:id_product', auth.authorizeManager, product.update)
routes.delete('/product/delete/:id_product', auth.authorizeManager, product.deleteById)


//- - - - - - - - - - Customer card endpoints - - - - - - - - - -

//Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
routes.get('/customers', auth.authorizeCashierOrManager, customer.getAll)

//Отримати інформацію про усіх постійних клієнтів, що мають карту клієнта із певним відсотком, посортованих за прізвищем
routes.get('/customersByPercent', auth.authorizeManager, customer.getAllByPercent)

//Отримати інформацію про усіх постійних клієнтів за прізвищем
routes.get('/customerBySurname', auth.authorizeCashier, customer.getBySurname)

//Додавати, редагувати, видаляти дані про товари
routes.get('/customer/:card_number', auth.authorizeManager, customer.getById)
routes.post('/customer/create', auth.authorizeCashierOrManager, customer.create)
routes.put('/customer/update/:card_number', auth.authorizeCashierOrManager, customer.update)
routes.delete('/api/customer/delete/:card_number', auth.authorizeManager, customer.deleteById)

//- - - - - - - - - - Products in storage endpoints - - - - - - - - - -

//Отримати інформацію про усі товари в магазині, відсортовані за назвою
routes.get('/storeProducts', auth.authorizeCashier, store_product.getAllNames)

//Отримати інформацію про усі акційні товари, відсортовані за кількістю одиниць товару
routes.get('/storeProducts/promotion', auth.authorizeCashierOrManager, store_product.getAllProm)

//Отримати інформацію про усі неакційні товари, відсортовані за кількістю одиниць товару
routes.get('/storeProducts/nonPromotion', auth.authorizeCashierOrManager, store_product.getAllNonProm)

//Отримати інформацію про усі товари в магазині, відсортовані за кількістю
routes.get('/storeProducts', auth.authorizeManager, store_product.getAll)

//За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару
routes.get('/storeProduct/:upc', auth.authorizeCashier, store_product.getById)

//За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару, назву та характеристики товару
routes.get('/storeProduct/:upc', auth.authorizeManager, store_product.getByIdAll)

//Додавати, редагувати, видаляти дані про товари у магазині
routes.get('/storeProduct/:upc', store_product.getById)
routes.post('/storeProduct/create', auth.authorizeManager, store_product.create)
routes.put('/storeProduct/update/:upc', auth.authorizeManager, store_product.update)
routes.delete('/storeProduct/delete/:upc', auth.authorizeManager, store_product.deleteById)

//- - - - - - - - - - Authentication endpoints - - - - - - - - - -

routes.post('/authenticate', auth.authenticate);
routes.post('/register', auth.register);

module.exports = routes;

//Manager
// 3. Видаляти дані прo чеки;
// 4. Видруковувати звіти з інформацією про усіх працівників, постійних клієнтів,
// категорії товарів, товари, товари у магазині, чеки;
// 17. Отримати інформацію про усі чеки, створені певним касиром за певний період
// часу (з можливістю перегляду куплених товарів у цьому чеку, їх назви, к-сті та ціни);
// 18. Отримати інформацію про усі чеки, створені усіма касирами за певний період
// часу (з можливістю перегляду куплених товарів у цьому чеку, їх назва, к-сті та ціни);
// 19. Визначити загальну суму проданих товарів з чеків, створених певним касиром за
// певний період часу;
// 20. Визначити загальну суму проданих товарів з чеків, створених усіма касиром за
// певний період часу;
// 21. Визначити загальну кількість одиниць певного товару, проданого за певний
// період часу.

//Cashier
// 7. Здійснювати продаж товарів (додавання чеків);
// 9. Переглянути список усіх чеків, що створив касир за цей день;
// 10. Переглянути список усіх чеків, що створив касир за певний період часу;
// 11. За номером чеку вивести усю інформацію про даний чек, в тому числі
// інформацію про назву, к-сть та ціну товарів, придбаних в даному чеку.
// 15. Можливість отримати усю інформацію про себе.