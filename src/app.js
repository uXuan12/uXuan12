// File: app.js (Đã làm sạch)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db'); // Chỉ cần poolPromise để đợi DB connect

// Import bộ định tuyến (Nơi chứa logic Login/AI/BI chuẩn)
const routes = require('./routes'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ===> QUAN TRỌNG: Mọi yêu cầu API sẽ đi qua file routes.js <===
app.use('/api', routes); 

// Route kiểm tra sức khỏe Server
app.get('/', (req, res) => {
    res.send('<h1>✅ Backend is Running...</h1>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await poolPromise; // Đợi DB kết nối xong mới cho Server chạy
        console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
        console.log(`🔌 Đã kết nối SQL Server thành công.`);
    } catch (err) {
        console.error('❌ Lỗi kết nối Database:', err);
    }
});