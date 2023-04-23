const {pool} = require("../db");
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const secretKey = 'notverysecretkey';
const getRoleForLogin = async (login) => {
    const query = `SELECT er.role_name
                   FROM employee empl
                            JOIN credentials c ON empl.login = c.login
                            JOIN employee_role er ON empl.empl_role_id = er.role_id
                   WHERE empl.login = $1;`
    const result = await pool.query(query, [login]);
    return result.rows[0].role_name;
};

const authenticate = async (req, res) => {
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
                    argon2.verify(hash, password, {hashLength: 32}).then(async (matches) => {
                        if (matches) {
                            const roleName = await getRoleForLogin(login);
                            const token = jwt.sign({'login': login, 'role': roleName}, secretKey, {expiresIn: '1h'});
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

const authorizeManager = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role_name === 'manager');
};

const authorizeCashier = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role_name === 'cashier');
}

const authorizeCashierPersonal = async (req, res, next) => {
    const emplId = req.params.id;
    if (!emplId) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    const query = `SELECT login
                   FROM employee
                   WHERE id_employee = $1`;

    const result = await pool.query(query, [emplId]);
    const login = result.rows[0].login
    if (!login) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    verifyTokenByPredicate(req, res, next, (decoded) => decoded.login === login);
}

const authorizeCashierOrManager = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role_name === 'cashier' || decoded.role_name === 'manager');
}

const verifyTokenByPredicate = (req, res, next, predicate) => {
    const token = req.headers['authorization'];
    if (!token || token.substring(0, 6) !== 'Bearer') {
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        const decoded = jwt.verify(token.substring(7), secretKey);
        if (predicate(decoded)) {
            next();
        } else {
            return res.status(401).json({message: 'Unauthorized'});
        }
    } catch (err) {
        console.error(err);
        return res.status(401).json({message: 'Unauthorized'});
    }
};

module.exports = {authenticate, authorizeManager, authorizeCashier, authorizeCashierOrManager, authorizeCashierPersonal}
