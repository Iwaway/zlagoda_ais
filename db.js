const dotenv = require("dotenv")
const Pool = require('pg').Pool

dotenv.config()

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
})

module.exports = {
    pool,
}