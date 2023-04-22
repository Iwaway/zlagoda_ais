const {pool} = require("../db");
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const authentificate = (req, res) => {
    const {login, password} = req.body;
    const query = `SELECT password
                   FROM credentials
                   WHERE login = $1`;
    pool.query(query, [login], (error, result) => {
        if (error) {
            res.status(500).json({message: error});
        } else {
            switch (result.rows.length) {
                case 0:
                    res.status(401).json({message: 'Invalid credentials'});
                    break;
                case 1:
                    const hash = result.rows[0].password
                    argon2.verify(hash, password, {hashLength: 32}).then((matches) => {
                        if (matches) {
                            const token = jwt.sign({"login": login}, 'notverysecretkey', {expiresIn: '1h'});
                            res.json({token});
                        } else {
                            res.status(401).json({message: 'Invalid credentials'});
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    });
}


module.exports = {authenticate: authentificate}
