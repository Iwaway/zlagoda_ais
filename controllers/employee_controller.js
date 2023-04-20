const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee ORDER BY empl_surname ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getAllCashiers = (request, response) => {
    pool.query('SELECT * FROM employee WHERE empl_role_id = (SELECT role_id FROM employee_role WHERE role_name = \'cashier\') ORDER BY empl_surname ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = request.params.id
    pool.query('SELECT * FROM employee WHERE id_employee = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getByNumberAndAdress = (request, response) => {
    const {
        phone_number,
        city,
        street
    } = request.body
    pool.query('SELECT * FROM employee WHERE phone_number = $1 AND city=$2 AND street=$3',
    [phone_number, city, street], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        id_employee,
        empl_surname,
        empl_name,
        empl_patronymic,
        empl_role_id,
        salary,
        date_of_birth,
        date_of_start,
        phone_number,
        city,
        street,
        zip_code
    } = request.body
    pool.query('INSERT INTO employee (id_employee, empl_surname, empl_name, empl_patronymic, empl_role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code) VALUES ($12, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [empl_surname, empl_name, empl_patronymic, empl_role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code, id_employee], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Employee added with ID: ${id_employee}`)
    })
}

const update = (request, response) => {
    const id = request.params.id
    const {
        empl_surname,
        empl_name,
        empl_patronymic,
        empl_role_id,
        salary,
        date_of_birth,
        date_of_start,
        phone_number,
        city,
        street,
        zip_code
    } = request.body
    pool.query(
        'UPDATE employee SET empl_surname = $1, empl_name = $2, empl_patronymic = $3, empl_role_id = $4, salary = $5, date_of_birth = $6, date_of_start = $7, phone_number = $8, city = $9, street = $10, zip_code = $11  WHERE id_employee = $12',
        [empl_surname, empl_name, empl_patronymic, empl_role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code, id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Employee modified with ID: ${id}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = request.params.id
    pool.query('DELETE FROM employee WHERE id_employee = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Employee deleted with ID: ${id}`)
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getAllCashiers,
    getByNumberAndAdress,
}