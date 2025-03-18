const express = require('express');
const { Redis } = require('@upstash/redis');
const app = express();

console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('REDIS_TOKEN:', process.env.REDIS_TOKEN);

const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

app.use(express.json());

// 登入路由
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const data = await redis.get('profit-data');
    const users = JSON.parse(data || '{"users":[]}').users;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.status(401).json({ success: false, message: '無效的用戶名或密碼' });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await redis.get('profit-data');
        if (data === null) {
            const initialData = { users: [], projects: [], deletedEmployees: [] };
            await redis.set('profit-data', JSON.stringify(initialData));
            res.json(initialData);
        } else {
            res.json(JSON.parse(data));
        }
    } catch (error) {
        console.error('Redis GET 錯誤:', error);
        res.status(500).json({ error: '後端服務器錯誤，無法獲取數據' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        await redis.set('profit-data', JSON.stringify(data));
        res.json(data);
    } catch (error) {
        console.error('Redis SET 錯誤:', error);
        res.status(500).json({ error: '後端服務器錯誤，無法保存數據' });
    }
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

module.exports = app;