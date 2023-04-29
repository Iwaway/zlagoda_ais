const {pool} = require("../db");
const utils = require("../utils/functions")

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee ORDER BY empl_surname ', (error, results) => {
        if (error) {
            console.log(error.message)
            return response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }

    })
}

const getAllCashiers = (request, response) => {
    pool.query('SELECT * FROM employee WHERE empl_role_id = (SELECT role_id FROM employee_role WHERE role_name = \'cashier\') ORDER BY empl_surname ', (error, results) => {
        if (error) {
            console.log(error.message)
            return response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }

    })
}

const getById = (request, response) => {
    const id = request.params.id_employee
    if (!id) {
        response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    pool.query('SELECT * FROM employee WHERE id_employee = $1', [id], (error, results) => {
        if (error) {
            console.log(error.message)
            return response.status(500).json({message: error.message})
        }
        if (results.rows.length) {
            response.status(200).json(results.rows[0]);
        } else {
            response.status(404).send();
        }
    })
}

const searchBySurname = (request, response) => {
    let {
        surname,
    } = request.body
    if (!surname) {
        response.status(400).json({message: "Bad Request: surname is mandatory"})
    }
    pool.query(`SELECT *
                FROM employee
                WHERE empl_surname LIKE $1;`,
        ['%' + surname + '%'], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }
        })
}

const create = (request, response) => {
    let patronymic = request.body.patronymic
    const {
        id,
        surname,
        name,
        roleId,
        salary,
        dateOfBirth,
        dateOfStart,
        phoneNumber,
        city,
        street,
        zipCode
    } = request.body
    patronymic = patronymic ?? null
    if (phoneNumber.length > 13) {
        return response.status(400).json({message: "Bad Request: phone number can not be longer that 13"})
    }
    if (!utils.underAgeValidate(dateOfBirth)) {
        return response.status(400).json({message: "Bad Request: age must be not under 18"})
    }
    pool.query('INSERT INTO employee (id_employee, empl_surname, empl_name, empl_patronymic, empl_role_id, salary, date_of_birth, date_of_start, phone_number, city, street, zip_code) VALUES ($12, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [surname, name, patronymic, roleId, salary, dateOfBirth, dateOfStart, phoneNumber, city, street, zipCode, id], (error) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message});
            } else {
                response.status(201).json({message: `Employee added with ID: ${id}`})
            }
        })
}

const update = (request, response) => {
    const id = request.params.id_employee
    if (!id) {
        response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    const {
        surname,
        name,
        patronymic,
        salary,
        dateOfBirth,
        dateOfStart,
        phoneNumber,
        city,
        street,
        zipCode
    } = request.body
    if (!surname || !name || !phoneNumber || !salary || !dateOfStart || !dateOfStart || !phoneNumber || !city || !street || !zipCode) {
        return response.status(400).json({message: "Bad Request: not all mandatory fields are provided"})
    }
    if (phoneNumber.length > 13) {
        return response.status(400).json({message: "Bad Request: phone number cannot be longer than 13"})
    }
    if (!utils.underAgeValidate(dateOfBirth)) {
        return response.status(400).json({message: "Bad Request: age must be not under 18"})
    }
    let query = 'UPDATE employee SET empl_surname = $1, empl_name = $2, empl_patronymic = $3, salary = $4, date_of_birth = $5, date_of_start = $6, phone_number = $7, city = $8, street=$9, zip_code = $10 WHERE id_employee = $11';
    pool.query(
        query,
        [surname, name, patronymic, salary, dateOfBirth, dateOfStart, phoneNumber, city, street, zipCode, id], (error) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json({message: `Employee modified with ID: ${id}`})
            }
        }
    )
}


const deleteById = (request, response) => {
    const id = request.params.id_employee
    if (!id) {
        return response.status(400).json({message: "Bad Params: employee id is mandatory"})
    }
    pool.query('DELETE FROM employee WHERE id_employee = $1', [id], (error) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message});
        } else {
            response.status(200).json({message: `Employee deleted with ID: ${id}`});

        }
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getAllCashiers,
    searchBySurname
}
