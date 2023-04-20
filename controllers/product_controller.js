const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM product ORDER BY product_name ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getAllByCategory = (request, response) => {
    const {
        category_number
    } = request.body
    pool.query('SELECT * FROM product WHERE category_number = $1 ORDER BY product_name ASC', [category_number], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getByName = (request, response) => {
    const {
        product_name
    } = request.body
    pool.query('SELECT * FROM product WHERE product_name = $1 ORDER BY product_name ASC', [product_name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('SELECT * FROM product WHERE id_product = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        product_name,
        category_number,
        characteristics
    } = request.body
    pool.query('INSERT INTO product (category_number, product_name, characteristics) VALUES ($2, $1, $3)',
    [product_name, category_number, characteristics], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Product added with name: ${product_name}`)
    })
}

const update = (request, response) => {
    const id = parseInt(request.params.id)
    const {
        product_name,
        category_number,
        characteristics
    } = request.body
    pool.query(
        'UPDATE product SET product_name = $1, category_number = $2, characteristics = $3 WHERE id_product = $4',
        [product_name, category_number, characteristics, id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Product modified with ID: ${id}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM product WHERE id_product = $1', [id], (error, results) => {
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
    getAllByCategory,
    getByName,
}