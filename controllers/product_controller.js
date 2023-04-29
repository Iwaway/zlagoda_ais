const {pool} = require("../db");

const getAll = (request, response) => {

    const query = `
        SELECT P.id_product,
               P.category_number,
               C.category_name,
               P.product_name,
               P.characteristics
        FROM product P
                 INNER JOIN category C
                            ON C.category_number = P.category_number
        ORDER BY product_name`

    pool.query(query, (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getAllByCategory = (request, response) => {
    const categoryNumber = request.params['categoryNumber']
    if (!categoryNumber) {
        return response.status(400).json({message: "Bad Request: category number is mandatory"})
    }
    pool.query('SELECT * FROM product WHERE category_number = $1 ORDER BY product_name ', [categoryNumber], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }

    })
}

const getByName = (request, response) => {
    const {
        name
    } = request.body
    if (!name) {
        return response.status(400).json({message: "Bad Request: name is mandatory"})
    }

    const query = `
        SELECT P.id_product,
               P.category_number,
               C.category_name,
               P.product_name,
               P.characteristics
        FROM product P
                 INNER JOIN category C
                            ON C.category_number = P.category_number
        WHERE P.product_name LIKE $1
        ORDER BY product_name`

    pool.query(query, ['%' + name + '%'], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id_product)
    if (!id) {
        response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    pool.query('SELECT * FROM product WHERE id_product = $1', [id], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else if (!results.rows.length) {
            response.status(404).json({message: 'Not found'})
        } else {
            response.status(200).json(results.rows[0])
        }
    })
}

const create = (request, response) => {
    const {
        name,
        categoryNumber,
        characteristics
    } = request.body
    if (!name || !categoryNumber || !characteristics) {
        return response.status(400).json({message: "Bad Request: name, category number, characteristics is mandatory"})
    }
    pool.query('INSERT INTO product (category_number, product_name, characteristics) VALUES ($2, $1, $3)',
        [name, categoryNumber, characteristics], (error) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(201).json({message: `Product added with name: ${name}`})
            }
        })
}

const update = (request, response) => {
    const id = parseInt(request.params.id_product)
    if (!id) {
        return response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    const {
        name,
        categoryNumber,
        characteristics
    } = request.body
    if (!name || !categoryNumber || !characteristics) {
        return response.status(400).json({message: "Bad Request: name, category number, characteristics is mandatory"})
    }
    pool.query(
        'UPDATE product SET product_name = $1, category_number = $2, characteristics = $3 WHERE id_product = $4',
        [name, categoryNumber, characteristics, id], (error) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json({message: `Product modified with ID: ${id}`})
            }
        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.id_product)
    if (!id) {
        return response.status(400).json({message: "Bad Params: id is mandatory"})
    }
    pool.query('DELETE FROM product WHERE id_product = $1', [id], (error) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json({message: `Product with ID: ${id}`})
        }
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
