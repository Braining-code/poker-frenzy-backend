const express = require('express');
const { register, verifyEmail, login, refresh } = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario
 * @body {email, username, password, agreeTerms}
 */
router.post('/register', register);

/**
 * @route POST /api/auth/verify-email
 * @desc Verificar email con código
 * @body {email, code}
 */
router.post('/verify-email', verifyEmail);

/**
 * @route POST /api/auth/login
 * @desc Login usuario
 * @body {email, password}
 */
router.post('/login', login);

/**
 * @route POST /api/auth/refresh
 * @desc Renovar JWT token
 * @body {refreshToken}
 */
router.post('/refresh', refresh);

module.exports = router;
