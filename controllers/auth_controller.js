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
    return result.rows[0]?.role_name;
};

const getEmployeeIdForLogin = async (login) => {
    const query = `SELECT id_employee
                   FROM employee
                   WHERE login = $1;`;
    const result = await pool.query(query, [login]);
    return result.rows[0]?.id_employee
}

const authenticate = async (req, res) => {
    const {login, password} = req.body;
    if (!login || !password) {
        res.status(400).json({message: "Bad Request: login and password is mandatory"})
    }
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
                            const employeeId = await getEmployeeIdForLogin(login);
                            const token = jwt.sign({
                                'login': login,
                                'role': roleName,
                                'id': employeeId
                            }, secretKey, {expiresIn: '1h'});
                            res.json({token: token});
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

const register = async (req, res) => {
    const {employeeId, login, password} = req.body;
    if (!employeeId || !login || !password) {
        return res.status(400).json({message: "Bad Params: employeeId, login and password is mandatory"})
    }
    if (login.length > 30) {
        return res.status(400).json({message: "Bad Params: login can be 30 or less characters long"})
    }
    if (password.length < 8 || password.length > 32) {
        return res.status(400).json({message: "Bad Params: password length must be between 8 and 32 characters"})
    }
    const checkLoginDoesNotExistQuery =
        'SELECT login FROM employee WHERE id_employee = $1 AND login IS NOT NULL';
    const loginExists = (await pool.query(checkLoginDoesNotExistQuery, [employeeId])).rows.length === 1
    if (loginExists) {
        return res.status(400).json({message: "Bad Params: employeeAlready registered"});
    }

    const passwordHashed = await argon2.hash(password, {hashLength: 32})
    const createCredentialsQuery = 'INSERT INTO credentials VALUES ($1, $2);';
    const credentialsCreated = await pool.query(createCredentialsQuery, [login, passwordHashed]);
    console.log(credentialsCreated)
    if (!credentialsCreated) {
        return res.status(500);
    }

    const updateEmployeeQuery = 'UPDATE employee SET login = $1 WHERE id_employee = $2'
    await pool.query(updateEmployeeQuery, [login, employeeId]);
    const roleName = getRoleForLogin(login);
    // todo: employeeId
    const token = jwt.sign({'login': login, 'role': roleName}, secretKey, {expiresIn: '1h'});
    res.json({token});
}

const authorizeManager = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role === 'manager');
};

const authorizeCashier = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role === 'cashier');
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

const authorizeManagerOrCashierPersonal = async (req, res, next) => {
    const employeeId = req.body.employeeId;
    if (!employeeId) {
        return res.status(500).json({message: 'id_employee in request params expected'});
    }

    const query = `SELECT login
                   FROM employee
                   WHERE id_employee = $1`;

    const result = await pool.query(query, [employeeId]);
    const login = result.rows[0].login
    if (!login) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    verifyTokenByPredicate(req, res, next, (decoded) => decoded.login === login && (decoded.role === 'manager' || (decoded.role === 'cashier' && decoded.id === employeeId)));
}

const authorizeCashierOrManager = (req, res, next) => {
    verifyTokenByPredicate(req, res, next, (decoded) => decoded.role === 'cashier' || decoded.role === 'manager');
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

const addIdToBody = (req, res, next) => {
    const decoded = jwt.decode(req.headers['authorization']?.substring(7))
    console.log(decoded);
    if (decoded.id) {
        req.body.employeeId = decoded.id;
    }
    next();
}

module.exports = {
    authenticate,
    register,
    authorizeManager,
    authorizeCashier,
    authorizeCashierOrManager,
    authorizeCashierPersonal,
    authorizeManagerOrCashierPersonal,
    addIdToBody
}
