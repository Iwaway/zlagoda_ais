const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM customer_card ORDER BY cust_surname ASC', (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

const getAllByPercent = (request, response) => {
    const {
        percent
    } = request.body
    const percentFormatted = parseInt(percent)
    pool.query('SELECT * FROM customer_card WHERE percent = $1 ORDER BY cust_surname ASC', [percentFormatted], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const card_number = request.params.card_number
    pool.query('SELECT * FROM customer_card WHERE card_number = $1', [card_number], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

const getBySurname = (request, response) => {
    const {
        surname
    } = request.body
    pool.query('SELECT * FROM customer_card WHERE cust_surname = $1',
    [surname], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        card_number,
        surname,
        name,
        patronymic,
        phone_number,
        city,
        street,
        zip_code,
        percent
    } = request.body
    pool.query('INSERT INTO customer_card (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent) VALUES ($9, $1, $2, $3, $4, $5, $6, $7, $8)',
    [surname, name, patronymic, phone_number, city, street, zip_code, percent, card_number], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(201).send(`Customer card added with ID: ${card_number}`)
    })
}

const update = (request, response) => {
    const card_number = request.params.card_number
    const {
        surname,
        name,
        patronymic,
        phone_number,
        city,
        street,
        zip_code,
        percent
    } = request.body
    pool.query(
        'UPDATE customer_card SET cust_surname = $1, cust_name = $2, cust_patronymic = $3, phone_number = $4, city = $5, street = $6, zip_code = $7, percent = $9  WHERE card_number = $8',
        [surname, name, patronymic, phone_number, city, street, zip_code, card_number, percent], (error, results) => {
            if (error) {
                response.status(400).send(`Bad request: ${error.message}`)
            }
            response.status(200).send(`Customer card modified with ID: ${card_number}`)
        }
    )
}

const deleteById = (request, response) => {
    const card_number = request.params.card_number
    pool.query('DELETE FROM customer_card WHERE card_number = $1', [card_number], (error, results) => {
        if (error) {
            response.status(400).send(`Bad request: ${error.message}`)
        }
        response.status(200).send(`Customer card deleted with ID: ${card_number}`)
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    getAllByPercent,
    getBySurname,
}
