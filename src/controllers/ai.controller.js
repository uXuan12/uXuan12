// File: backend/controllers/ai.controller.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db'); 
const dbSchema = require('../config/dbContext');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.chat = async (req, res) => {
    try {
        const { question } = req.body;
        // req.user lấy từ auth.middleware (token giải mã ra)
        const username = req.user.user; 
        
        console.log(`🔍 DEBUG AI: User [${username}] đang hỏi: ${question}`);

        // 1. KIỂM TRA QUYỀN TRONG DB
        // Nếu user đăng nhập được nhưng không có dòng nào trong bảng user_scope -> Trả về 403
        const scopeResult = await db.query(`
            SELECT s.region_code 
            FROM auth.users u
            JOIN auth.user_scope s ON u.user_id = s.user_id
            WHERE u.username = @username
        `, { username });

        if (scopeResult.recordset.length === 0) {
            console.error(`❌ DEBUG AI: User [${username}] không có quyền vùng (No Scope).`);
            // ===> ĐÂY LÀ CHỖ GÂY RA LỖI 403 <===
            return res.status(403).json({ reply: "Bạn chưa được phân quyền vùng dữ liệu nào để hỏi AI." });
        }

        const userScope = scopeResult.recordset[0].region_code;
        console.log(`✅ DEBUG AI: User [${username}] có quyền vùng: ${userScope}`);

        // 2. GỌI AI (Text-to-SQL)
        const promptToSQL = `
        ${dbSchema}
        Câu hỏi: "${question}"
        Lưu ý: Viết SQL lọc theo tham số @userScope.
        `;
        
        const aiResult1 = await model.generateContent(promptToSQL);
        let sqlQuery = aiResult1.response.text().replace(/```sql|```/g, '').trim();

        if (/DROP|DELETE|UPDATE|INSERT|ALTER/i.test(sqlQuery)) {
            return res.status(403).json({ reply: "Tôi chỉ được quyền xem dữ liệu." });
        }

        // 3. CHẠY SQL
        const dbResult = await db.query(sqlQuery, { userScope });
        const rawData = dbResult.recordset;

        // 4. TRẢ LỜI
        const promptToText = `
        Câu hỏi: "${question}"
        Dữ liệu: ${JSON.stringify(rawData)}
        Trả lời ngắn gọn bằng tiếng Việt.
        `;

        const aiResult2 = await model.generateContent(promptToText);
        res.json({ reply: aiResult2.response.text() });

    } catch (err) {
        console.error("❌ AI Error:", err);
        res.status(500).json({ reply: "Lỗi hệ thống." });
    }
};