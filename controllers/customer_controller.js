const { pool } = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM customer_card ORDER BY cust_surname ASC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getAllByPercent = (request, response) => {
    const {
        percent
    } = request.body
    if (!percent) {
        response.status(400).json({message: "Bad Request: percent is mandatory"})
    }

    if (percent<0) {
        response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    const percentFormatted = parseInt(percent)
    pool.query('SELECT * FROM customer_card WHERE percent = $1 ORDER BY cust_surname ASC', [percentFormatted], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const card_number = request.params.card_number
    if (!card_number) {
        response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
    pool.query('SELECT * FROM customer_card WHERE card_number = $1', [card_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getBySurname = (request, response) => {
    const {
        surname
    } = request.body
    if (!surname) {
        response.status(400).json({message: "Bad Request: surname is mandatory"})
    }
    pool.query('SELECT * FROM customer_card WHERE cust_surname = $1',
    [surname], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const create = (request, response) => {
    let {
        patronymic,
        city,
        street,
        zip_code
    } = request.body
    const {
        card_number,
        surname,
        name,
        phone_number,
        percent
    } = request.body
    if (!card_number || !surname || !name || !phone_number || !percent) {
        response.status(400).json({message: "Bad Request: card number, surname, name, phone_number, percent is mandatory"})
    }
    if (percent<0) {
        response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    if (phone_number.length>13) {
        response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    patronymic = patronymic ?? null
    city = city ?? null
    street = street ?? null
    zip_code = zip_code ?? null
    pool.query('INSERT INTO customer_card (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent) VALUES ($9, $1, $2, $3, $4, $5, $6, $7, $8)',
    [surname, name, patronymic, phone_number, city, street, zip_code, percent, card_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(201).send(`Customer card added with ID: ${card_number}`)
    })
}

const update = (request, response) => {
    const card_number = request.params.card_number
    if (!card_number) {
        response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
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
    if (!surname || !name || !phone_number || !city || !street || !zip_code || !percent) {
        response.status(400).json({message: "Bad Request: card number is mandatory"})
    }
    if (percent<0) {
        response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    if (phone_number.length>13) {
        response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    let query = 'UPDATE customer_card SET cust_surname = $1, cust_name = $2,';
    if (patronymic) {
        query += ` cust_partonimic = ${patronymic},`
    }
    query += ' phone_number = $3, city = $4, street = $5, zip_code = $6, percent = $8  WHERE card_number = $7';

        pool.query(query,
        [surname, name, phone_number, city, street, zip_code, card_number, percent], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).send(error.message)
            }
            response.status(200).send(`Customer card modified with ID: ${card_number}`)
        }
    )
}

const deleteById = (request, response) => {
    const card_number = request.params.card_number
    if (!card_number) {
        response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
    pool.query('DELETE FROM customer_card WHERE card_number = $1', [card_number], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
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
