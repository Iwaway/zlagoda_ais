const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM product ORDER BY product_name ASC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllByCategory = (request, response) => {
    const {
        category_number
    } = request.body
    if (!category_number) {
        response.status(400).json({message: "Bad Request: category number is mandatory"})
    }
    pool.query('SELECT * FROM product WHERE category_number = $1 ORDER BY product_name ASC', [category_number], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getByName = (request, response) => {
    const {
        name
    } = request.body
    if (!name) {
        response.status(400).json({message: "Bad Request: name is mandatory"})
    }
    pool.query('SELECT * FROM product WHERE product_name = $1 ORDER BY product_name ASC', [name], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    if (!id) {
        response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    pool.query('SELECT * FROM product WHERE id_product = $1', [id], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        name,
        category_number,
        characteristics
    } = request.body
    if (!name || !category_number || !characteristics) {
        response.status(400).json({message: "Bad Request: name, category number, characteristics is mandatory"})
    }
    pool.query('INSERT INTO product (category_number, product_name, characteristics) VALUES ($2, $1, $3)',
    [name, category_number, characteristics], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(201).send(`Product added with name: ${name}`)
    })
}

const update = (request, response) => {
    const id = parseInt(request.params.id)
    if (!id) {
        response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    const {
        name,
        category_number,
        characteristics
    } = request.body
    if (!name || !category_number || !characteristics) {
        response.status(400).json({message: "Bad Request: name, category number, characteristics is mandatory"})
    }
    pool.query(
        'UPDATE product SET name = $1, category_number = $2, characteristics = $3 WHERE id_product = $4',
        [name, category_number, characteristics, id], (error, results) => {
            if (error) {
                response.status(500).send(error.message)
                console.log(error.message)
            }
            response.status(200).send(`Product modified with ID: ${id}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.id)
    if (!id) {
        response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    pool.query('DELETE FROM product WHERE id_product = $1', [id], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).send(`Product with ID: ${id}`)
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
