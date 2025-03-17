const express = require('express');
const fs = require('fs');
const app = express();

// 設置 CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    next();
});

// 解析 JSON 請求主體
app.use(express.json());

// 初始數據
let data = {
    users: [
        { username: "boss", password: "1234", role: "boss" },
        { username: "employee1", password: "5678", role: "employee", id: "01", name: "員工1", position: "技工" }
    ],
    projects: [],
    deletedEmployees: []
};

// 從文件載入數據
const dataFilePath = './data.json';
if (fs.existsSync(dataFilePath)) {
    const rawData = fs.readFileSync(dataFilePath);
    data = JSON.parse(rawData);
    console.log('數據從文件載入成功');
}

// GET 端點：獲取數據
app.get('/api/data', (req, res) => {
    console.log('收到 GET 請求，返回數據:', data);
    res.json(data);
});

// POST 端點：儲存數據
app.post('/api/data', (req, res) => {
    console.log('收到 POST 請求，數據:', req.body);
    data = req.body;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log('數據已儲存到文件');
    res.json(data);
});

// 啟動伺服器
app.listen(3000, () => {
    console.log('伺服器運行中，端口 3000');
});