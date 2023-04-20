const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM customer_card ORDER BY cust_surname ASC', (error, results) => {
        if (error) {
            throw error
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
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = request.params.id
    pool.query('SELECT * FROM customer_card WHERE card_number = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getBySurname = (request, response) => {
    const {
        cust_surname
    } = request.body
    pool.query('SELECT * FROM customer_card WHERE cust_surname = $1',
    [cust_surname], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    const {
        card_number,
        cust_surname,
        cust_name,
        cust_patronymic,
        phone_number,
        city,
        street,
        zip_code,
        percent
    } = request.body
    pool.query('INSERT INTO customer_card (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent) VALUES ($9, $1, $2, $3, $4, $5, $6, $7, $8)',
    [cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent, card_number, ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Customer card added with ID: ${card_number}`)
    })
}

const update = (request, response) => {
    const id = request.params.id
    const {
        cust_surname,
        cust_name,
        cust_patronymic,
        phone_number,
        city,
        street,
        zip_code,
        percent
    } = request.body
    pool.query(
        'UPDATE customer_card SET cust_surname = $1, cust_name = $2, cust_patronymic = $3, phone_number = $4, city = $5, street = $6, zip_code = $7, percent = $9  WHERE card_number = $8',
        [cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, id, percent], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Customer card modified with ID: ${id}`)
        }
    )
}

const deleteById = (request, response) => {
    const id = request.params.id
    pool.query('DELETE FROM customer_card WHERE card_number = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Customer card deleted with ID: ${id}`)
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