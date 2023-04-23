const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee ORDER BY empl_surname ASC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllCashiers = (request, response) => {
    pool.query('SELECT * FROM employee WHERE empl_role_id = (SELECT role_id FROM employee_role WHERE role_name = \'cashier\') ORDER BY empl_surname ASC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = request.params.id
    if (!id) {
        response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    pool.query('SELECT * FROM employee WHERE id_employee = $1', [id], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getNumberAndAddress = (request, response) => {
    const {
        surname,
    } = request.body
    if (!surname) {
        response.status(400).json({message: "Bad Request: surname is mandatory"})
    }
    pool.query('SELECT phone_number, city, street FROM employee WHERE empl_surname = $1',
    [surname], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    let patronymic = request.body.patronymic
    const {
        id,
        surname,
        name,
        role_id,
        salary,
        date_of_birth,
        date_of_start,
        phone_number,
        city,
        street,
        zip_code
    } = request.body
    patronymic = patronymic ?? null
    pool.query('INSERT INTO employee (id_employee, empl_surname, empl_name, empl_patronymic, empl_role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code) VALUES ($12, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [surname, name, patronymic, role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code, id], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(201).send(`Employee added with ID: ${id}`)
    })
}

const update = (request, response) => {
    const id = request.params.id
    if (!id) {
        response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    let patronymic = request.body.patronymic
    const {
        surname,
        name,
        role_id,
        salary,
        date_of_birth,
        date_of_start,
        phone_number,
        city,
        street,
        zip_code
    } = request.body
    if (!surname || !name || !phone_number || !role_id || !salary || !date_of_birth || !date_of_start || !phone_number || !city || !street || !zip_code) {
        response.status(400).json({message: "Bad Request: mandatory fields are null"})
    }
    let query = 'UPDATE employee SET empl_surname = $1, empl_name = $2,';
    if (patronymic) {
        query += ` empl_patronymic = ${patronymic},`
    }
    query += ' empl_role_id = $3, salary = $4, date_of_birth = $5, date_of_start = $6, phone_number = $7, city = $8, street=$9, zip_code = $10 WHERE id_employee = $11';
    pool.query(
        query,
        [surname, name, role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code, id], (error, results) => {
            if (error) {
                response.status(500).send(error.message)
                console.log(error.message)
            }
            response.status(200).send(`Employee modified with ID: ${id}`)
        }
    )
}


const deleteById = (request, response) => {
    const id = request.params.id
    if (!id) {
        response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    pool.query('DELETE FROM employee WHERE id_employee = $1', [id], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
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
    getNumberAndAddress
}
