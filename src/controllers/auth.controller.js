const db = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { username } = req.body;

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

        // Gom tất cả các Region và Customer Type vào mảng, loại bỏ trùng lặp (Set)
        const regions = [...new Set(result.recordset.map(item => item.region_code).filter(i => i))];
        const customerTypes = [...new Set(result.recordset.map(item => item.customer_type).filter(i => i))];

        res.json({
            success: true,
            user_info: {
                db_username: firstRecord.username,
                regions: regions,        // Trả về mảng: ["Hà Nội", "Hải Phòng"]
                customer_types: customerTypes // Trả về mảng: ["B2B", "B2C"]
            }
        });

    } catch (error) {
        console.error("Lỗi SQL:", error.message);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};