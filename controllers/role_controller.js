const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee_role ORDER BY role_name ASC', (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM employee_role WHERE role_id = $1', [id], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

module.exports = {
    getAll,
    getById,
}