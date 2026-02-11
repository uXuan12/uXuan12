const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('❌ DB Connection Error:', err.message);
        process.exit(1);
    });

module.exports = {
    query: async (sqlText, params = {}) => {
        const pool = await poolPromise;
        const request = pool.request();
        Object.keys(params).forEach(key => request.input(key, params[key]));
        return request.query(sqlText);
    },
    poolPromise
};