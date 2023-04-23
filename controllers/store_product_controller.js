const { pool } = require("../db");

const getAllNames = (request, response) => {
    pool.query('SELECT product.product_name, upc, upc_prom, selling_price, products_number, promotion_product, store_product.id_product FROM store_product, product WHERE (store_product.id_product = product.id_product) ORDER BY product.product_name ASC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAll = (request, response) => {
    pool.query('SELECT * FROM store_product ORDER BY products_number DESC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllProm = (request, response) => {
    pool.query('SELECT * FROM store_product WHERE promotion_product = true ORDER BY products_number DESC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllNonProm = (request, response) => {
    pool.query('SELECT * FROM store_product WHERE promotion_product = false ORDER BY products_number DESC', (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    pool.query('SELECT selling_price, products_number FROM store_product WHERE upc = $1', [upc], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getByIdAll = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    pool.query('SELECT selling_price, products_number, product.product_name, product.characteristics FROM store_product, product WHERE (store_product.id_product = product.id_product) AND upc = $1', [upc], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    let upc_prom = request.body.upc_prom
    const {
        upc,
        id_product,
        price,
        number,
        isPromotional
    } = request.body
    upc_prom = upc_prom ?? null
    if (!upc || !id_product || !price || !number || !isPromotional) {
        response.status(400).json({message: "Bad Request: upc, id_product, price, number, isPromotional are mandatory"})
    }
    if (price<0 || number<0) {
        response.status(400).json({message: "Bad Request: price or number cannot be less then 0"})
    }
    pool.query('INSERT INTO store_product (upc, upc_prom, id_product, selling_price, products_number, promotion_product) VALUES ($1, $2, $3, $4, $5, $6)',
    [upc, upc_prom, id_product, price, number, isPromotional], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(201).send(`Product added to store with upc: ${upc}`)
    })
}

const update = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    const {
        upc_prom,
        id_product,
        price,
        number,
        isPromotional
    } = request.body
    if (!id_product || !price || !number || !isPromotional) {
        response.status(400).json({message: "Bad Request: upc, id_product, price, number, isPromotional are mandatory"})
    }
    if (price<0 || number<0) {
        response.status(400).json({message: "Bad Request: price or number cannot be less then 0"})
    }
    let query = 'UPDATE store_product SET id_product = $1, selling_price = $2,';
    if (upc_prom) {
        query += ` upc_prom = ${upc_prom},`
    }
    query += ' products_number = $3, promotion_product = $4 WHERE upc = $5';
    pool.query(
        query,
        [id_product, price, number, isPromotional, upc], (error, results) => {
            if (error) {
                response.status(500).send(error.message)
                console.log(error.message)
            }
            response.status(200).send(`Product modified in store with upc: ${upc}`)
        }
    )
}

const deleteById = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    pool.query('DELETE FROM store_product WHERE upc = $1', [upc], (error, results) => {
        if (error) {
            response.status(500).send(error.message)
            console.log(error.message)
        }
        response.status(200).send(`Product in store deleted with upc: ${upc}`)
    })
}

module.exports = {
    getAllNames,
    getAll,
    getByIdAll,
    getById,
    create,
    update,
    deleteById,
    getAllProm,
    getAllNonProm,
}
