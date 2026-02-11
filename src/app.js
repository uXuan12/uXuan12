require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { query, poolPromise } = require('./config/db');

const routes = require('./routes');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', routes);
// 1. Kiểm tra trạng thái Server
app.get('/', (req, res) => {
    res.send('<h1>✅ Backend is Running on Port 5000</h1>');
});

// 2. API LOGIN (Dùng POST)
app.post('/api/login', async (req, res) => {
    try {
        const { username } = req.body;
        console.log('Đang login cho user:', username);

        // Truy vấn bảng users (Lưu ý: bỏ auth. nếu bạn không dùng schema auth)
        const result = await query(`
            SELECT user_id, username, role_code 
            FROM auth.users 
            WHERE username = @username
        `, { username });

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'User không tồn tại' });
        }

        const user = result.recordset[0];
        const token = jwt.sign(
            { id: user.user_id, user: user.username, role: user.role_code },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ access_token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. API CHECK QUYỀN BI
app.get('/api/bi/check-access', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Thiếu Token' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await query(`
            SELECT COUNT(*) AS cnt FROM auth.user_scope WHERE user_id = @id
        `, { id: decoded.id });

        res.json({ allowed: result.recordset[0].cnt > 0 });
    } catch (err) {
        res.status(403).json({ message: 'Token không hợp lệ' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await poolPromise; // Đợi DB kết nối xong
    console.log(`🚀 Server: http://localhost:${PORT}`);
});