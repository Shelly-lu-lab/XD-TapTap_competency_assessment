const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// 导入OAuth配置
const { 
    OAUTH_CONFIG, 
    buildAuthorizeUrl, 
    buildTokenUrl, 
    buildProfileUrl, 
    buildLogoutUrl,
    generateState,
    validateState
} = require('./oauth-config.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 内存存储用户会话（生产环境建议使用Redis或数据库）
const userSessions = new Map();

// OAuth认证路由
app.get('/auth/login', (req, res) => {
    try {
        // 生成state参数防止CSRF攻击
        const state = generateState();
        
        // 存储state到会话中
        const sessionId = req.query.sessionId || generateState();
        userSessions.set(sessionId, { state, timestamp: Date.now() });
        
        // 构建授权URL
        const authorizeUrl = buildAuthorizeUrl(state);
        
        console.log('Redirecting to SSO:', authorizeUrl);
        
        // 重定向到SSO认证页面
        res.redirect(authorizeUrl);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// OAuth回调处理
app.get('/auth/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        console.log('OAuth callback received:', { code: !!code, state: !!state, error });
        
        if (error) {
            console.error('OAuth error:', error);
            return res.redirect('/?error=auth_failed');
        }
        
        if (!code || !state) {
            console.error('Missing code or state');
            return res.redirect('/?error=invalid_request');
        }
        
        // 验证state参数（这里简化处理，实际应该从会话中获取）
        // const sessionState = userSessions.get(sessionId)?.state;
        // if (!validateState(sessionState, state)) {
        //     return res.redirect('/?error=invalid_state');
        // }
        
        // 交换授权码获取访问令牌
        const tokenUrl = buildTokenUrl(code);
        console.log('Exchanging code for token:', tokenUrl);
        
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();
        
        console.log('Token response:', { success: tokenResponse.ok, hasError: !!tokenData.error });
        
        if (!tokenResponse.ok || tokenData.error) {
            console.error('Token exchange failed:', tokenData);
            return res.redirect('/?error=token_failed');
        }
        
        // 获取用户信息
        const profileUrl = buildProfileUrl(tokenData.access_token);
        console.log('Fetching user profile:', profileUrl);
        
        const profileResponse = await fetch(profileUrl);
        const userData = await profileResponse.json();
        
        console.log('User profile response:', { success: profileResponse.ok, hasError: !!userData.error });
        
        if (!profileResponse.ok || userData.error) {
            console.error('Profile fetch failed:', userData);
            return res.redirect('/?error=profile_failed');
        }
        
        // 创建用户会话
        const sessionId = generateState();
        const sessionData = {
            user: userData,
            accessToken: tokenData.access_token,
            expiresAt: Date.now() + (tokenData.expires_in * 1000),
            timestamp: Date.now()
        };
        
        userSessions.set(sessionId, sessionData);
        
        // 重定向到应用主页，携带会话ID
        res.redirect(`/?sessionId=${sessionId}`);
        
    } catch (error) {
        console.error('Callback error:', error);
        res.redirect('/?error=callback_failed');
    }
});

// 获取用户信息API
app.get('/api/user', (req, res) => {
    try {
        const sessionId = req.query.sessionId;
        
        if (!sessionId) {
            return res.status(401).json({ error: 'No session ID provided' });
        }
        
        const session = userSessions.get(sessionId);
        
        if (!session || !session.user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        
        // 检查会话是否过期
        if (session.timestamp && (Date.now() - session.timestamp) > OAUTH_CONFIG.SESSION_TIMEOUT) {
            userSessions.delete(sessionId);
            return res.status(401).json({ error: 'Session expired' });
        }
        
        res.json({
            user: session.user,
            sessionId: sessionId
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// 登出API
app.post('/api/logout', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (sessionId) {
            userSessions.delete(sessionId);
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// 检查登录状态API
app.get('/api/auth/status', (req, res) => {
    try {
        const sessionId = req.query.sessionId;
        
        if (!sessionId) {
            return res.json({ isLoggedIn: false });
        }
        
        const session = userSessions.get(sessionId);
        
        if (!session || !session.user) {
            return res.json({ isLoggedIn: false });
        }
        
        // 检查会话是否过期
        if (session.timestamp && (Date.now() - session.timestamp) > OAUTH_CONFIG.SESSION_TIMEOUT) {
            userSessions.delete(sessionId);
            return res.json({ isLoggedIn: false });
        }
        
        res.json({
            isLoggedIn: true,
            user: session.user
        });
        
    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({ error: 'Failed to check auth status' });
    }
});

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

// 处理根路径，提供index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理所有其他路径，提供index.html（用于SPA路由）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
