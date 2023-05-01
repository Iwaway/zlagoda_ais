const {response} = require("express");
const {pool} = require("../db");

const getAllNames = (request, response) => {

    const query = `
        SELECT product.product_name,
               upc,
               upc_prom,
               selling_price,
               products_number,
               promotion_product,
               store_product.id_product
        FROM store_product,
             product
        WHERE (store_product.id_product = product.id_product)
        ORDER BY product.product_name`

    pool.query(query, (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getAll = (request, response) => {

    const query = `
        SELECT SP.upc,
               SP.upc_prom,
               SP.id_product,
               P.product_name,
               SP.id_product,
               SP.selling_price,
               SP.products_number,
               SP.promotion_product
        FROM store_product SP
                 INNER JOIN product P
                            ON P.id_product = SP.id_product
        ORDER BY products_number DESC`

    pool.query(query, (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const searchByName = (request, response) => {

    const search = request.body.name;

    if (!search) {
        return response.status(400).json({message: 'Name to search by is mandatory'})
    }

    const query = `
        SELECT SP.upc,
               SP.upc_prom,
               SP.id_product,
               P.product_name,
               SP.id_product,
               SP.selling_price,
               SP.products_number,
               SP.promotion_product
        FROM store_product SP
                 INNER JOIN product P
                            ON P.id_product = SP.id_product
        WHERE product_name LIKE $1
        ORDER BY products_number DESC`

    pool.query(query, ['%' + search + '%'], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getAllProm = (request, response) => {
    pool.query('SELECT * FROM store_product WHERE promotion_product = true ORDER BY products_number DESC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getAllNonProm = (request, response) => {
    pool.query('SELECT * FROM store_product WHERE promotion_product = false ORDER BY products_number DESC', (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getById = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        return response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    pool.query('SELECT selling_price, products_number FROM store_product WHERE upc = $1', [upc], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const getByIdAll = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    const query = `
        SELECT SP.upc,
               SP.upc_prom,
               SP.id_product,
               P.product_name,
               SP.id_product,
               SP.selling_price,
               SP.products_number,
               SP.promotion_product
        FROM store_product SP
                 INNER JOIN product P
                            ON P.id_product = SP.id_product
        WHERE upc = $1`

    pool.query(query, [upc], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else if (results.rows.length) {
            response.status(200).json(results.rows[0])
        } else {
            response.status(404).send();
        }
    })
}

const create = async (request, response) => {
    const {
        upc,
        id,
        price
    } = request.body
    if (!upc || !id || !price) {
        return response.status(400).json({message: "Bad Request: upc, id and price are mandatory"})
    }
    if (price < 0) {
        return response.status(400).json({message: "Bad Request: selling price cannot be less then 0"})
    }
    await changePriceIfExist(id, price)
    pool.query('INSERT INTO store_product (upc, id_product, selling_price, products_number, promotion_product) VALUES ($1, $2, $3, $4, $5)',
        [upc, id, price, 0, false], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(201).json({message: `Product added to store with upc: ${upc}`})
            }
        }
    );
}

const putOnPromotion = async (request, response) => {
    const upc = request.params.upc;
    const {count, id, price, upcPromotional} = request.body;

    if (!count || !id || !price || !upcPromotional) {
        return response.status(400).json({message: "Bad Request: id, upcPromotional, price and count of product to be put on promotion is mandatory in body"})
    }

    const lowerProductCountQuery = `
        UPDATE store_product
        SET products_number = products_number - $1
        WHERE upc = $2
          AND products_number >= $1`

    const updated = await pool.query(lowerProductCountQuery, [count, upc]);
    if (!updated.rowCount) {
        return response.status(500).send();
    }

    const createIfNotExistsQuery = `
        INSERT INTO store_product (upc, id_product, selling_price, products_number, promotion_product)
        VALUES ($1, $2, 0, 0, true)
        ON CONFLICT DO NOTHING`
    const created = await pool.query(createIfNotExistsQuery, [upcPromotional, id]);

    if (!created.rowsAffected) {
        const linkProductToPromotionalQuery = `
            UPDATE store_product
            SET upc_prom = $1
            WHERE upc = $2`
        await pool.query(linkProductToPromotionalQuery, [upcPromotional, upc])
    }

    const promotionalPrice = calculatePromotionalPrice(price)
    const updatePromotionalQuery = `
        UPDATE store_product
        SET selling_price   = $1,
            products_number = products_number + $2
        WHERE upc = $3`;
    pool.query(updatePromotionalQuery, [promotionalPrice, count, upcPromotional], (error, results) => {
        if (error) {
            response.status(500).json({message: error});
        } else {
            response.status(200).json({message: `Successfully put on promotoion ${count} units of product ${upc}`})
        }
    })
}

const registerReception = async (request, response) => {
    const {
        id,
        count,
        price
    } = request.body;

    if (!id || !count || !price || !parseInt(count) || !parseFloat(price)) {
        return response.status(400).json({message: 'Bad params: id, count and price are mandatory'})
    }

    const updateNonPromotionalQuery = `
        UPDATE store_product
        SET selling_price   = $1,
            products_number = products_number + $2
        WHERE id_product = $3
          AND promotion_product = false`

    const nonPromotionalUpdated = await pool.query(updateNonPromotionalQuery, [price, count, id]);
    if (nonPromotionalUpdated.rowsAffected === 0) {
        return response.status(404).json({message: `Store product with id_product ${id} was not found`})
    }

    const promotionalPrice = calculatePromotionalPrice(price);
    const updatePromotionalQuery = `
        UPDATE store_product
        SET selling_price = $1
        WHERE id_product = $2
          AND promotion_product = true`

    pool.query(updatePromotionalQuery, [promotionalPrice, id], (error, result) => {
        if (error) {
            console.log(error);
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json({message: `Reception of product with id ${id} registered successfully`})
        }
    });
}

const getByProductIdAll = async (id_product) => {
    const query = 'SELECT * FROM store_product WHERE id_product = $1'
    const result = await pool.query(query, [id_product]);
    return result.rows;
}

const changePriceIfExist = async (id_product, price) => {
    const products = await getByProductIdAll(id_product)
    products.forEach(async element => {
        let {
            upc,
            upc_prom,
            id_product,
            products_number,
            promotion_product
        } = element
        const query = 'UPDATE store_product SET upc_prom = $2, id_product = $3, selling_price = $4, products_number = $5, promotion_product = $6  WHERE upc = $1'
        await pool.query(query, [upc, upc_prom, id_product, price, products_number, promotion_product]);
    });

}

const update = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    const {
        upc_prom,
        id_product,
        price,
        number,
        isPromotional
    } = request.body
    if (!id_product || !price || !number || !isPromotional) {
        response.status(400).json({message: "Bad Request: upc, id_product, price, number, isPromotional are mandatory"})
    }
    if (price < 0 || number < 0) {
        response.status(400).json({message: "Bad Request: price or number cannot be less then 0"})
    }
    let query = 'UPDATE store_product SET id_product = $1, selling_price = $2,';
    if (upc_prom) {
        query += ` upc_prom = ${upc_prom},`
    }
    query += ' products_number = $3, promotion_product = $4 WHERE upc = $5';
    pool.query(
        query,
        [id_product, price, number, isPromotional, upc], (error, results) => {
            if (error) {
                console.log(error.message)
                response.status(500).json({message: error.message})
            } else {
                response.status(200).json({message: `Product modified in store with upc: ${upc}`})
            }
        }
    )
}

const deleteById = (request, response) => {
    const upc = request.params.upc
    if (!upc) {
        response.status(400).json({message: "Bad Params: upc is mandatory"})
    }
    pool.query('DELETE FROM store_product WHERE upc = $1', [upc], (error, results) => {
        if (error) {
            console.log(error.message)
            response.status(500).json({message: error.message})
        } else {
            response.status(200).json({message: `Product in store deleted with upc: ${upc}`})
        }
    })
}

function calculatePromotionalPrice(initial) {
    return (initial * 0.8).toFixed(4);
}

module.exports = {
    getAllNames,
    getAll,
    searchByName,
    registerReception,
    getByIdAll,
    getById,
    create,
    putOnPromotion,
    update,
    deleteById,
    getAllProm,
    getAllNonProm,
}
