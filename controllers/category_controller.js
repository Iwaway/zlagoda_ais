const {pool} = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM category ORDER BY category_name;', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.category_number)
    if (!id) {
        response.status(400).json({message: "Bad Params: category number is mandatory"})
    }
    pool.query('SELECT * FROM category WHERE category_number = $1', [id], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else if (!results.rows.length) {
            response.status(404).send();
        } else {
            response.status(200).json(results.rows[0])
        }
    })
}

const create = (request, response) => {
    const {
        name
    } = request.body
    if (!name) {
        return response.status(400).json({message: "Bad Request: name is mandatory"})
    }
    pool.query('INSERT INTO category (category_name) VALUES ($1)',
        [name], (error, result) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(201).json({message: `Category added with name: ${name}`});
            }
        })
}

const update = (request, response) => {
    const id = parseInt(request.params.category_number)
    if (!id) {
        response.status(400).json({message: "Bad Params: category number is mandatory"})
    }
    const {
        name
    } = request.body
    if (!name) {
        response.status(400).json({message: "Bad Request: name is mandatory"})
    }
    pool.query(
        'UPDATE category SET category_name = $1 WHERE category_number = $2',
        [name, id], (error) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json({message: `Category modified with number: ${id}`});
            }

        }
    )
}

const deleteById = (request, response) => {
    const id = parseInt(request.params.category_number)
    if (!id) {
        response.status(400).json({message: "Bad Params: category number is mandatory"})
    }
    pool.query('DELETE FROM category WHERE category_number = $1', [id], (error) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json({message: `Category deleted with ID: ${id}`})
        }
    })
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById,
}
