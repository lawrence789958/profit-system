const fs = require('fs').promises;

let redis;
try {
    if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
        throw new Error('Redis 環境變量未設置');
    }
    redis = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN,
    });
    console.log('Redis 初始化成功');
    await redis.ping().then(() => {
        console.log('Redis 連接測試成功');
    });
} catch (error) {
    console.error('Redis 初始化失敗:', error.message);
    console.error('詳細錯誤信息:', error);
    console.error('環境變量狀態:', {
        REDIS_URL_EXISTS: !!process.env.REDIS_URL,
        REDIS_TOKEN_EXISTS: !!process.env.REDIS_TOKEN
    });
    redis = null;
}

// 備用：從本地 JSON 載入數據
let localData = { users: [], projects: [], deletedEmployees: [] };
try {
    const data = await fs.readFile('initial-data.json', 'utf8');
    localData = JSON.parse(data);
    console.log('從本地 JSON 載入初始數據');
} catch (error) {
    console.warn('本地 JSON 載入失敗，將使用空數據:', error);
}

// 修改 /api/data 端點
app.get('/api/data', async (req, res) => {
    if (redis) {
        try {
            const data = await redis.get('profit-data');
            if (data === null) {
                await redis.set('profit-data', JSON.stringify(localData));
                res.json(localData);
            } else {
                res.json(JSON.parse(data));
            }
        } catch (error) {
            console.error('Redis GET 錯誤:', error);
            res.status(500).json({ error: '後端服務器錯誤，無法獲取數據' });
        }
    } else {
        res.json(localData); // 當 Redis 不可用時返回本地數據
    }
});