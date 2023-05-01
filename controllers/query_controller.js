const {pool} = require("../db");

const getCountGroupingByReceipt = async (request, response) => {
    const query = `
        SELECT receipt.receipt_number, SUM(sale.product_number) AS productNumber
        FROM receipt
                 LEFT JOIN sale ON receipt.receipt_number = sale.receipt_number
        GROUP BY receipt.receipt_number
        ORDER BY SUM(sale.product_number) DESC `
    await pool.query(query, (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getLessByNumber = async (request, response) => {
    const number = request.params.number
    if (!number) {
        console.log(error.message)
        response.status(400).send('Bad Params: number is mandatory')
    }
    const query = 'SELECT * FROM store_product WHERE NOT EXISTS ( SELECT * FROM product WHERE product.id_product = store_product.id_product AND product.id_product NOT IN (SELECT store_product.id_product FROM store_product WHERE store_product.products_number < $1))'
    await pool.query(query, [number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getCountAndSumByCustomer = async (request, response) => {
    const query = `
    SELECT customer_card.cust_name, customer_card.cust_surname, COUNT(receipt.receipt_number) AS num_purchases, SUM(receipt.sum_total) AS total_spent
    FROM customer_card
        JOIN receipt ON customer_card.card_number = receipt.card_number
    GROUP BY customer_card.card_number
    ORDER BY total_spent DESC;
     `
    await pool.query(query, (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getCustomersForPromotion = async (request, response) => {
    const {
        sum,
        city
    } = request.body
    if (!sum || !city) {
        console.log(error.message)
        response.status(400).send('Bad Params: sum and city are mandatory')
    }
    const query = `
    SELECT cust_name, cust_surname
    FROM customer_card
    WHERE card_number NOT IN (
        SELECT card_number
        FROM receipt
        WHERE sum_total < $1
        AND id_employee NOT IN (
            SELECT id_employee
            FROM employee
            WHERE city <> $2
        )
    ); `
    await pool.query(query, [sum, city], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

module.exports = {
    getCountGroupingByReceipt,
    getLessByNumber,
    getCountAndSumByCustomer,
    getCustomersForPromotion,
}
