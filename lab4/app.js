const express = require('express');
const jwt = require('jsonwebtoken'); 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
app.use(express.json());

const SECRET_KEY = 'my_secret_key';

// 1. โหลดไฟล์ swagger.yaml มาใช้งาน
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. Route /login สำหรับขอ Token [cite: 515]
app.post('/login', (req, res) => {
    const { username } = req.body; // Accepts username [cite: 516]
    
    // ถ้า username คือ "admin" ให้ sign token ด้วย payload { role: 'admin' } [cite: 517]
    // ถ้าไม่ใช่ ให้ sign token ด้วย payload { role: 'user' } [cite: 518]
    const payload = username === 'admin' ? { role: 'admin' } : { role: 'user' };
    
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token }); // Return the token to the client [cite: 519]
});

// 3. Authentication Middleware [cite: 520]
const authenticateToken = (req, res, next) => {
    // Extracts the token from the Authorization: Bearer <token> header [cite: 521]
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Unauthorized: ไม่พบ Token' });

    // Verifies the token. If valid, attach the payload to req.user [cite: 522]
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden: Token ไม่ถูกต้อง' });
        req.user = user;
        next();
    });
};

// 4. Authorization Middleware (checkAdmin) [cite: 523]
const checkAdmin = (req, res, next) => {
    // Checks if req.user.role is exactly 'admin' [cite: 524]
    if (req.user.role !== 'admin') {
        // If not, return status 403 Forbidden [cite: 525]
        return res.status(403).json({ message: 'Forbidden: สำหรับ Admin เท่านั้น' });
    }
    next();
};

// 5. Protected route /admin-only that uses both middlewares [cite: 526]
app.get('/admin-only', authenticateToken, checkAdmin, (req, res) => {
    res.json({ message: 'Welcome Admin!' });
});

// เริ่มเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000/api-docs');
});