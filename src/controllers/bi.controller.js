const db = require('../config/db');

exports.checkBIAllowed = async (req, res) => {
    try {
        // req.user chứa thông tin đã giải mã từ token (bao gồm region và custType)
        const isAllowed = req.user.region || req.user.role === 'ADMIN';

        if (!isAllowed) {
            return res.status(403).json({ allowed: false, message: 'No scope assigned.' });
        }
        

        res.json({ 
            allowed: true, 
            filters: {
                region: req.user.region,
                customerType: req.user.custType
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};