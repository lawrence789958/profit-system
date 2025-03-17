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
    const data = await kv.get('data') || { users: [], projects: [], deletedEmployees: [] };
    res.json(data);
});

app.post('/api/data', async (req, res) => {
    const data = req.body;
    await kv.set('data', data);
    res.json(data);
});

// 添加根路徑重定向
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`伺服器運行中，端口 ${port}`);
});