const {pool} = require("../db");

const getCountGroupingByReceipt = async (request, response) => {
    const query = 'SELECT receipt.receipt_number, SUM(sale.product_number) AS productNumber FROM receipt LEFT JOIN sale ON receipt.receipt_number = sale.receipt_number GROUP BY receipt.receipt_number'
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

module.exports = {
    getCountGroupingByReceipt,
    getLessByNumber,
}
