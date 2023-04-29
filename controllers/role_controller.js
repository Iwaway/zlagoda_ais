const {pool} = require("../db");

const getAll = (request, response) => {
    pool.query('SELECT * FROM employee_role ORDER BY role_name ASC', (error, results) => {
        if (error) {
            console.log(error.message)
            return response.status(500).json({message: error.message})
        }
        response.status(200).json(results.rows)
    })
}

const getById = (request, response) => {
    const id = parseInt(request.params.id)
    if (!id || id < 0) {
        return response.status(404).send();
    }
    pool.query('SELECT * FROM employee_role WHERE role_id = $1', [id], (error, results) => {
        if (error) {
            console.log(error.message)
            return response.status(500).json({message: error.message})
        }
        if (!results.rows) {
            return response.status(404).send();
        }
        response.status(200).json(results.rows)
    })
}

module.exports = {
    getAll,
    getById,
}
