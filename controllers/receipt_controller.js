const {pool} = require("../db");
const {validateSales, createSaleRecord} = require("./sale_controller");
const {getDiscountPercentageByCardNumber} = require("./customer_controller");

const getById = (request, response) => {
    const receipt_number = request.params.receipt_number
    if (!receipt_number) {
        response.status(400).json({message: "Bad Params: receipt number is mandatory"})
    }
    pool.query('SELECT receipt.receipt_number, product_name, products_number, sp.selling_price  FROM receipt INNER JOIN sale ON sale.receipt_number = receipt.receipt_number INNER JOIN store_product sp ON sp.upc = sale.upc INNER JOIN product ON product.id_product = sp.id_product WHERE receipt.receipt_number = $1 ORDER BY product_name ASC', [receipt_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }

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
        [id_employee, begin, end], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }

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
        [id_employee, begin, end], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows);
            }
        }
    )
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
        [begin, end], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }
        })
}

const getAllByPeriod = (request, response) => {
    const {
        begin,
        end
    } = request.body
    if (!begin || !end) {
        return response.status(400).json({message: "Bad Request: begin date and end date are mandatory"})
    }
    const query = `
        SELECT R.receipt_number, R.id_employee, E.empl_name, R.card_number, R.print_date, R.sum_total, R.vat
        FROM receipt R
                 INNER JOIN employee E on R.id_employee = E.id_employee
        WHERE print_date > $1
          AND print_date < $2
        ORDER BY print_date DESC`
    pool.query(query,
        [begin, end], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }
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
        [begin, end], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }

        })
}

const create = async (request, response) => {
    const {receipt, employeeId} = request.body;
    let cardNumber = request.body.cardNumber;
    cardNumber = cardNumber ?? null;

    if (!validateSales(receipt) || !employeeId) {
        return response.status(400).json({message: 'Bad params: employeeId is mandatory and receipt must be and array, each element having upc, count and price'})
    }

    const receiptNumber = await getNextAvailableReceiptNumber();
    const printDate = new Date().toISOString();
    let pricesSum = sumPricesInReceipt(receipt);
    if (cardNumber) {
        const discountPercentage = (await getDiscountPercentageByCardNumber(cardNumber)) ?? 0;
        pricesSum = pricesSum * (1 - discountPercentage / 100);
    }
    const vat = pricesSum * 0.25;

    const result = await pool.query('INSERT INTO receipt (receipt_number, id_employee, card_number, print_date, sum_total, vat) VALUES ($1, $2, $3, $4, $5, $6)',
        [receiptNumber, employeeId, cardNumber, printDate, pricesSum + vat, vat])

    if (!result.rowCount) {
        return response.status(500).json({message: 'Failed to create a receipt'})
    }

    for (let sale of receipt) {
        const result = await createSaleRecord(receiptNumber, sale.upc, sale.count, sale.price);
        if (!result) {
            return response.status(500).json({message: 'Failed to create one of sale records'})
        }
    }

    response.status(201).json({message: `Receipt added with number: ${receiptNumber}`})
}

const deleteById = (request, response) => {
    const receipt_number = request.params.receipt_number
    if (!receipt_number) {
        response.status(400).json({message: "Bad Params: receipt number is mandatory"})
    }
    pool.query('DELETE FROM receipt WHERE receipt_number = $1', [receipt_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        }
        response.status(200).send(`Receipt deleted with number: ${receipt_number}`)
    })
}

const getNextAvailableReceiptNumber = async () => {
    const query = `
        SELECT receipt_number
        FROM receipt
        ORDER BY receipt_number DESC
        LIMIT 1`
    const topNumberString = (await pool.query(query)).rows[0].receipt_number;
    const topNumber = topNumberString ? parseInt(topNumberString) : 0;
    return `${topNumber + 1}`.padStart(10, '0');
}

sumPricesInReceipt = (receipt) => {
    let total = 0;
    for (let sale of receipt) {
        total += sale.price * sale.count;
    }
    return total;
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
