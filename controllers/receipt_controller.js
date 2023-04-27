const { pool } = require("../db");

const getAllNames = (request, response) => {
    pool.query('SELECT product.product_name, upc, upc_prom, selling_price, products_number, promotion_product, store_product.id_product FROM store_product, product WHERE (store_product.id_product = product.id_product) ORDER BY product.product_name ASC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}
//Отримати інформацію про усі чеки, створені певним касиром за певний період
// часу (з можливістю перегляду куплених товарів у цьому чеку, їх назви, к-сті та ціни);

const getAll = (request, response) => {
    pool.query('SELECT * FROM store_product ORDER BY products_number DESC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllProm = (request, response) => {
    pool.query('SELECT * FROM store_product WHERE promotion_product = true ORDER BY products_number DESC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
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
            console.log(error.message)
            response.status(500).send(error.message)
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
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    let card_number = request.body.card_number
    let percent
    const {
        receipt_number,
        id_employee,
        date,
        sum,
    } = request.body
    card_number = card_number ?? null
    if (card_number){
        pool.query('SELECT percent FROM customer_card WHERE card_number = $1'), [card_number], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).send(error.message)
            }
            percent = response.status(200).json(results.rows)
        }
    }
    if (!receipt_number || !id_employee || !date || !sum) {
        response.status(400).json({message: "Bad Request: number, id_employee, date, sum are mandatory"})
    }
    if (sum<0) {
        response.status(400).json({message: "Bad Request: sum cannot be less then 0"})
    }
    if (percent){
        sum = sum - sum*percent*0,01
    }
    const vat = sum * 0.2
    pool.query('INSERT INTO receipt (receipt_number, id_employee, card_number, print_date, sum_total, vat) VALUES ($1, $2, $3, $4, $5, $6)',
    [receipt_number, id_employee, card_number, date, sum, vat], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(201).send(`Receipt added with number: ${receipt_number}`)
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
                console.log(error.message)
                response.status(500).send(error.message)
            }
            response.status(200).send(`Product modified in store with upc: ${upc}`)
        }
    )
}

const deleteById = (request, response) => {
    const receipt_number = request.params.receipt_number
    if (!receipt_number) {
        response.status(400).json({message: "Bad Params: receipt number is mandatory"})
    }
    pool.query('DELETE FROM receipt WHERE receipt_number = $1', [receipt_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).send(`Receipt deleted with number: ${receipt_number}`)
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
}
