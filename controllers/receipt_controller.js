const { pool } = require("../db");

const getById = (request, response) => {
    const receipt_number = request.params.receipt_number
    if (!receipt_number) {
        response.status(400).json({message: "Bad Params: receipt number is mandatory"})
    }
    pool.query('SELECT receipt.receipt_number, product_name, products_number, sp.selling_price  FROM receipt INNER JOIN sale ON sale.receipt_number = receipt.receipt_number INNER JOIN store_product sp ON sp.upc = sale.upc INNER JOIN product ON product.id_product = sp.id_product WHERE receipt.receipt_number = $1 ORDER BY product_name ASC', [receipt_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllByCashier = (request, response) => {
    const id_employee = request.params.id_employee
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    if (!id_employee) {
        response.status(400).json({message: "Bad Params: id employee is mandatory"})
    }
    pool.query('SELECT receipt.receipt_number, product_name, products_number, sp.selling_price  FROM receipt INNER JOIN sale ON sale.receipt_number = receipt.receipt_number INNER JOIN store_product sp ON sp.upc = sale.upc INNER JOIN product ON product.id_product = sp.id_product WHERE id_employee = $1 AND print_date > $2 AND print_date < $3 ORDER BY product_name ASC',
    [id_employee, begin, end] ,(error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getSumByCashier = (request, response) => {
    const id_employee = request.params.id_employee
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    if (!id_employee) {
        response.status(400).json({message: "Bad Params: id employee is mandatory"})
    }
    pool.query('SELECT SUM(sum_total) FROM receipt WHERE id_employee = $1 AND print_date > $2 AND print_date < $3',
    [id_employee, begin, end] ,(error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getSumByPeriod = (request, response) => {
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    pool.query('SELECT SUM(sum_total) FROM receipt WHERE print_date > $1 AND print_date < $2',
    [begin, end] ,(error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllByPeriod = (request, response) => {
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    const query = 'SELECT receipt.receipt_number, product_name, products_number, sp.selling_price  FROM receipt INNER JOIN sale ON sale.receipt_number = receipt.receipt_number INNER JOIN store_product sp ON sp.upc = sale.upc INNER JOIN product ON product.id_product = sp.id_product WHERE print_date > $1 AND print_date < $2 ORDER BY product_name ASC'
    console.log(query)
    pool.query(query,
    [begin, end] ,(error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getCountByPeriod = (request, response) => {
    const product_id = request.params.product_id
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    if (!product_id) {
        response.status(400).json({message: "Bad Params: product id is mandatory"})
    }
    pool.query('SELECT COUNT(sp.id_product) FROM receipt INNER JOIN sale ON sale.receipt_number = receipt.receipt_number INNER JOIN store_product sp ON sp.upc = sale.upc WHERE print_date > $1 AND print_date < $2',
    [begin, end] ,(error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = async (request, response) => {
    let card_number = request.body.card_number
    let percent
    const {
        receipt_number,
        id_employee,
        date,
    } = request.body
    card_number = card_number ?? null
    if (card_number){
        percent = await getPercentByCustomer(card_number)
    }
    if (!receipt_number || !id_employee || !date) {
        response.status(400).json({message: "Bad Request: number, id_employee, date are mandatory"})
    }
    const vat = 0
    pool.query('INSERT INTO receipt (receipt_number, id_employee, card_number, print_date, sum_total, vat) VALUES ($1, $2, $3, $4, $5, $6)',
    [receipt_number, id_employee, card_number, date, 0, vat], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(201).send(`Receipt added with number: ${receipt_number}`)
    })
}

const getPercentByCustomer = async (card_number) => {
    const query = 'SELECT percent FROM customer_card WHERE card_number = $1'
    const result = await pool.query(query, [card_number]);
    return result.rows[0].percent
}

const getSumByNumber = async (receipt_number) => {
    const query = 'SELECT SUM(selling_price) FROM sale WHERE receipt_number = $1'
    const result = await pool.query(query, [receipt_number]);
    console.log(result.rows[0])
    return result.rows[0];
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
    create,
    getAllByCashier,
    getAllByPeriod,
    deleteById,
    getSumByCashier,
    getSumByPeriod,
    getCountByPeriod,
    getById,
}
