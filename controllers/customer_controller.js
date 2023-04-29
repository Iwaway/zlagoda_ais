const {pool} = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM customer_card ORDER BY cust_surname ASC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).send(error.message)
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const cardNumber = request.params.cardNumber
    if (!cardNumber) {
        response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
    pool.query('SELECT * FROM customer_card WHERE card_number = $1', [cardNumber], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else if (!results.rows.length) {
            response.status(404).send();
        } else {
            response.status(200).json(results.rows[0]);
        }

    })
}

const create = (request, response) => {
    let {
        patronymic,
        city,
        street,
        zipCode
    } = request.body
    const {
        cardNumber,
        surname,
        name,
        phoneNumber,
        percentage
    } = request.body
    if (!cardNumber || !surname || !name || !phoneNumber || !percentage) {
        return response.status(400).json({message: "Bad Request: card number, surname, name, phone_number, percent is mandatory"})
    }
    if (percentage < 0) {
        return response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    if (phoneNumber.length > 13) {
        return response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    patronymic = patronymic ?? null
    city = city ?? null
    street = street ?? null
    zipCode = zipCode ?? null
    pool.query('INSERT INTO customer_card (card_number, cust_surname, cust_name, cust_patronymic, phone_number, city, street, zip_code, percent) VALUES ($9, $1, $2, $3, $4, $5, $6, $7, $8)',
        [surname, name, patronymic, phoneNumber, city, street, zipCode, percentage, cardNumber], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(201).json({message: `Customer card added with ID: ${cardNumber}`})
            }
        })
}

const update = (request, response) => {
    const cardNumber = request.params.cardNumber
    if (!cardNumber) {
        return response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
    let {
        patronymic,
        city,
        street,
        zipCode
    } = request.body;

    const {
        surname,
        name,
        phoneNumber,
        percentage
    } = request.body

    patronymic = patronymic ?? null;
    city = city ?? null;
    street = street ?? null;
    zipCode = zipCode ?? null;

    if (!cardNumber || !surname || !name || !phoneNumber || !percentage) {
        return response.status(400).json({message: "Bad Request: some mandatory fields were omitted in request body"})
    }
    if (percentage < 0) {
        return response.status(400).json({message: "Bad Request: percent cannot be less then 0"})
    }
    if (phoneNumber.length > 13) {
        return response.status(400).json({message: "Bad Request: phoneNumber can not be longer than 13"});
    }
    let query = 'UPDATE customer_card SET cust_surname = $1, cust_name = $2, cust_patronymic = $3, phone_number = $4, city = $5, street = $6, zip_code = $7, percent = $8  WHERE card_number = $9';

    pool.query(query,
        [surname, name, patronymic, phoneNumber, city, street, zipCode, percentage, cardNumber], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json({message: `Customer card modified with ID: ${cardNumber}`});
            }
        }
    )
}

const deleteById = (request, response) => {
    const cardNumber = request.params.cardNumber
    if (!cardNumber) {
        return response.status(400).json({message: "Bad Params: card number is mandatory"})
    }
    pool.query('DELETE FROM customer_card WHERE card_number = $1', [cardNumber], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json({message: `Customer card deleted with ID: ${cardNumber}`})
        }
    })
}

const searchBySurname = (request, response) => {
    const {
        surname
    } = request.body
    if (!surname) {
        return response.status(400).json({message: "Bad Request: surname is mandatory"})
    }
    pool.query('SELECT * FROM customer_card WHERE cust_surname LIKE $1',
        ['%' + surname + '%'], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json(results.rows)
            }
        })
}

const searchByPercent = (request, response) => {
    const {
        percentage
    } = request.body
    if (!percentage) {
        return response.status(400).json({message: "Bad Request: percentage is mandatory in body"})
    }

    const percentageParsed = parseInt(percentage)
    if (!percentageParsed || percentageParsed < 0) {
        return response.status(400).json({message: "Bad Request: percentage must be a positive integer"})
    }

    pool.query('SELECT * FROM customer_card WHERE percent = $1 ORDER BY cust_surname ASC', [percentageParsed], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
    searchByPercent,
    searchBySurname,
}
