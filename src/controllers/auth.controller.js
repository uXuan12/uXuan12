// File: backend/controllers/auth.controller.js
const db = require('../config/db');
const jwt = require('jsonwebtoken'); // Đã import thư viện

exports.login = async (req, res) => {
    try {
        const { username } = req.body;

        // 1. Truy vấn DB
        const result = await db.query(`
            SELECT u.[username], s.[region_code], s.[customer_type]
            FROM [auth].[users] AS u
            LEFT JOIN [auth].[user_scope] AS s ON u.[user_id] = s.[user_id]
            WHERE u.[username] = @username  and u.[status] = 'active'
        `, { username });

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'User không tồn tại!' });
        }

        // Lấy thông tin chung từ dòng đầu tiên
        const firstRecord = result.recordset[0];

        // Gom tất cả các Region và Customer Type vào mảng
        const regions = [...new Set(result.recordset.map(item => item.region_code).filter(i => i))];
        const customerTypes = [...new Set(result.recordset.map(item => item.customer_type).filter(i => i))];

        // ============================================================
        // [QUAN TRỌNG] BƯỚC THIẾU: TẠO JWT TOKEN
        // ============================================================
        const token = jwt.sign(
            { 
                user: firstRecord.username, // Payload: Lưu username để Middleware và AI Controller đọc
                roles: regions              // (Tùy chọn) Lưu thêm quyền nếu cần
            }, 
            process.env.JWT_SECRET || 'secret_key_demo', // Khóa bí mật
            { expiresIn: '24h' }
        );

        // ============================================================
        // TRẢ VỀ KẾT QUẢ KÈM TOKEN
        // ============================================================
        res.json({
            success: true,
            access_token: token, // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
            user_info: {
                db_username: firstRecord.username,
                regions: regions,
                customer_types: customerTypes
            }
        });

    } catch (error) {
        console.error("Lỗi SQL:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};