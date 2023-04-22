const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM category ORDER BY category_name ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM category WHERE category_number = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        name
    } = request.body
    pool.query('INSERT INTO category (category_name) VALUES ($1)',
    [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Category added with name: ${name}`)
    })
}

const update = (request, response) => {
    const id = parseInt(request.params.id)
    const {
        name
    } = request.body
    pool.query(
        'UPDATE category SET category_name = $1 WHERE category_number = $2',
        [name, id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Category modified with name: ${name}}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM category WHERE category_number = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Category deleted with ID: ${id}`)
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
}
