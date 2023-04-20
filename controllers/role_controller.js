const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee_role ORDER BY role_name ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM employee_role WHERE role_id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        role_name
    } = request.body
    pool.query('INSERT INTO employee_role (role_name) VALUES ($1)',
    [role_name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Role added with ID: ${id_employee}`)
    })
}

const update = (request, response) => {
    const id = parseInt(request.params.id)
    const {
        role_name
    } = request.body
    pool.query(
        'UPDATE employee_role SET role_name = $1 WHERE role_id = $2',
        [role_name, id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Role modified with ID: ${id}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM employee_role WHERE role_id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Role deleted with ID: ${id}`)
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
}