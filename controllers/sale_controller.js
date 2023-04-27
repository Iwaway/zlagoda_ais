const { pool } = require("../db");

const create = async (request, response) => {
    const {
        upc,
        receipt_number,
        product_number,
    } = request.body
    if (!upc || !receipt_number || !product_number) {
        response.status(400).json({message: "Bad Request: upc, receipt number, product number are mandatory"})
    }
    const selling_price = await getPrice(upc)
    pool.query('INSERT INTO sale (upc, receipt_number, product_number, selling_price) VALUES ($1, $2, $3, $4)',
    [upc, receipt_number, product_number, selling_price], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(201).send(`Receipt added with number: ${receipt_number}`)
    })
}

const createMany = async (request, response) => {
    const sales  = request.body
    if (sales){
        response.status(400)
    }
    let count = 0
    let total_price = 0
    const discount = await getPercentByCustomer(sales[0].receipt_number)
    const prices = await getPrices(sales)
    let query = 'INSERT INTO sale (upc, receipt_number, product_number, selling_price) VALUES '
    console.log(prices.rows)
    sales.forEach(element => {
        const {
            upc,
            receipt_number,
            product_number,
        } = element
        if (!upc || !receipt_number || !product_number) {
            response.status(400).json({message: "Bad Request: upc, receipt number, product number are mandatory"})
        }
        query += '('+upc+', '+receipt_number+', '+product_number+', '+prices.rows[count].revised_price+'), '
        total_price += parseFloat(prices.rows[count].revised_price)
        count += 1
    });
    query = query.slice(0, -2);
    console.log(query)
    await pool.query(query)
    total_price = total_price - total_price*parseFloat(discount)*0.01
    await updateReceipt(sales[0].receipt_number, total_price);
    response.status(201).send(`Sales added`)
}

const getPrice = async (upc) => {
    let price
    const query = 'SELECT selling_price FROM store_product WHERE upc = $1'
    const result = await pool.query(query, [upc])[0].selling_price;
    const upc_prom = await pool.query('SELECT upc_prom FROM store_product WHERE upc = $1',[upc])[0].upc_prom
    if (upc_prom){
        price = parseFloat(result) * 0,8
    }else {
        price = parseFloat(result)
    }
    return price;
}

const getPrices = async (sales) => {
    let query = 'SELECT revised_price FROM (SELECT selling_price, upc_prom, CASE WHEN upc_prom <> \'\' THEN selling_price*0.8 ELSE selling_price END AS revised_price FROM store_product WHERE upc IN ('
    sales.forEach(element => {
        const upc = element.upc
        query += '\''+upc + '\''+', '
    })
    query = query.slice(0, -2);
    query += ')) AS prices'
    const result = await pool.query(query)
    return result;
}

const getPercentByCustomer = async (receipt_number) => {
    let percent
    const card_number = await pool.query('SELECT card_number FROM receipt WHERE receipt_number = $1',[receipt_number]).card_number
    if (card_number){
        const query = 'SELECT percent FROM customer_card WHERE card_number = $1'
        const result = await pool.query(query, [card_number]);
        percent = parseInt(result.rows[0].percent)
    } else {
        percent = 0
    }
    return percent
}

const updateReceipt = async (receipt_number, total_price) => {
    console.log(total_price)
    const vat = total_price *0.2
    const receipt = await pool.query('SELECT * FROM receipt WHERE receipt_number = $1', [receipt_number])
    console.log(receipt.rows[0])
    const {
        id_employee,
        card_number,
        print_date
    } = receipt.rows[0]
    console.log(id_employee)
    const query = 'UPDATE receipt SET id_employee = $1, card_number = $2, print_date = $3, sum_total = $4, vat = $5 WHERE receipt_number = $6'
    pool.query(query, [id_employee, card_number, print_date, total_price, vat, receipt_number]);
}

module.exports = {
    create,
    createMany,
}
