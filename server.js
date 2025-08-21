const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 代理API请求到阿里云
app.post('/api/qwen', async (req, res) => {
    try {
        // 验证请求体
        if (!req.body || !req.body.input || !req.body.input.messages) {
            console.error('Invalid request body:', req.body);
            return res.status(400).json({ error: 'Invalid request body' });
        }

        // 从环境变量获取API Key，如果没有则使用默认值
        const apiKey = process.env.QWEN_API_KEY || "sk-9fb5bfd2c28c41d48324fef824e9c4e3";
        const apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
        
        // 使用阿里云API的正确格式
        const requestBody = {
            model: req.body.model || "qwen-turbo",
            input: {
                messages: req.body.input.messages
            },
            parameters: {
                result_format: "message"
            }
        };
        
        // 添加调试日志
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        console.log('Formatted request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const result = await response.json();
        console.log('API response:', JSON.stringify(result, null, 2));
        
        if (!response.ok) {
            console.error('API error:', result);
            return res.status(response.status).json(result);
        }
        
        // 转换API响应格式以匹配前端期望
        const formattedResult = {
            output: {
                choices: [
                    {
                        message: {
                            content: result.output.text || result.output.choices?.[0]?.message?.content || result.output
                        }
                    }
                ]
            }
        };
        
        console.log('Formatted response:', JSON.stringify(formattedResult, null, 2));
        res.json(formattedResult);
    } catch (error) {
        console.error('API proxy error:', error);
        res.status(500).json({ error: 'API request failed' });
    }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 只有在本地开发时才启动服务器
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser`);
    });
}

// 导出app以支持Vercel
module.exports = app;
