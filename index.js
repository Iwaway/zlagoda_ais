const express = require('express');
const { Client } = require("pg")
const dotenv = require("dotenv")
const bodyParser = require('body-parser');
const cors = require('cors')
const routes = require('./routes/routes');

const app = express();

dotenv.config()
app.use(cors());
app.use(bodyParser.json());

app.use('/', routes);

app.use((req, res, next) => {
    res.status(404).json({error: 'Not found'});
});

app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({error: error.message});
});

const server = app.listen(3499, () => {
    console.log(`Server listening on port ${server.address().port}`);
    // connectDb();
});

// const connectDb = async () => {
//     try {
//         const client = new Client({
//             user: process.env.PGUSER,
//             host: process.env.PGHOST,
//             database: process.env.PGDATABASE,
//             password: process.env.PGPASSWORD,
//             port: process.env.PGPORT
//     })
//         await client.connect()
//         console.log("Database connected!");
//     } catch (error) {
//         console.log(error)
//     }   
// }
