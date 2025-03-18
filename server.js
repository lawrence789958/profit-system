const express = require('express');
const { Redis } = require('@upstash/redis');
const app = express();

// 初始化 Upstash Redis
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