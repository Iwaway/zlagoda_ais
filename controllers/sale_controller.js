const {pool} = require("../db");

const createSaleRecord = async (receiptNumber, upc, count, price) => {
    const insertSaleQuery = `
        INSERT INTO sale (upc, receipt_number, product_number, selling_price)
        VALUES ($1, $2, $3, $4)`
    const insertSaleResult = await pool.query(insertSaleQuery, [upc, receiptNumber, count, price]);

    if (insertSaleResult.rowCount) {
        const updateProductCountQuery = `
            UPDATE store_product
            SET products_number = products_number - $1
            WHERE upc = $2`
        const updateProductCountResult = await pool.query(updateProductCountQuery, [count, upc])
        return !!updateProductCountResult.rowCount
    }
    return false;
}

const validateSales = (receipt) => {
    if (!Array.isArray(receipt) || !receipt.length)
        return false;

    for (let sale of receipt) {
        if (!sale.upc || !sale.count || !sale.price) {
            return false;
        }
    }
    return true;
}

module.exports = {
    validateSales,
    createSaleRecord
}
