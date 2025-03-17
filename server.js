const express = require('express');
const { kv } = require('@vercel/kv');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

app.use(express.json());

app.get('/api/data', async (req, res) => {
    try {
        const data = await kv.get('profit-data') || { users: [], projects: [], deletedEmployees: [] };
        res.json(data);
    } catch (error) {
        console.error('KV GET 錯誤:', error);
        res.status(500).json({ error: '無法獲取數據' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;
        await kv.set('profit-data', data);
        res.json(data);
    } catch (error) {
        console.error('KV SET 錯誤:', error);
        res.status(500).json({ error: '無法保存數據' });
    }
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`伺服器運行中，端口 ${port}`);
});