const express = require('express');
const router = express.Router();
const auth = require('./controllers/auth.controller');
const bi = require('./controllers/bi.controller');
const checkAuth = require('./middleware/auth.middleware');

// Lưu ý: Route login là POST, không phải GET
router.post('/login', auth.login);
router.get('/bi/check-access', checkAuth, bi.checkBIAllowed);

module.exports = router;