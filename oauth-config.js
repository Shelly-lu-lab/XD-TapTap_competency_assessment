// OAuth SSO 配置
const OAUTH_CONFIG = {
    // SSO认证中心地址
    SSO_BASE_URL: 'https://sso.security.xindong.com',
    
    // OAuth端点
    AUTHORIZE_URL: 'https://sso.security.xindong.com/cas/oauth2.0/authorize',
    TOKEN_URL: 'https://sso.security.xindong.com/cas/oauth2.0/accessToken',
    PROFILE_URL: 'https://sso.security.xindong.com/cas/oauth2.0/profile',
    LOGOUT_URL: 'https://sso.security.xindong.com/cas/logout',
    
    // 应用配置
    CLIENT_ID: 'xdcompetency',
    CLIENT_SECRET: 'nbU6GBa3skvJD',
    REDIRECT_URI: 'https://xdcompetency.vercel.app/auth/callback',
    
    // OAuth参数
    RESPONSE_TYPE: 'code',
    GRANT_TYPE: 'authorization_code',
    SCOPE: 'openid',
    
    // 应用域名
    APP_DOMAIN: 'https://xdcompetency.vercel.app',
    
    // 会话配置
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8小时
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5分钟前刷新
};

// 构建授权URL
function buildAuthorizeUrl(state = null) {
    const params = new URLSearchParams({
        response_type: OAUTH_CONFIG.RESPONSE_TYPE,
        client_id: OAUTH_CONFIG.CLIENT_ID,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
        scope: OAUTH_CONFIG.SCOPE
    });
    
    if (state) {
        params.append('state', state);
    }
    
    return `${OAUTH_CONFIG.AUTHORIZE_URL}?${params.toString()}`;
}

// 构建令牌交换URL
function buildTokenUrl(code) {
    const params = new URLSearchParams({
        grant_type: OAUTH_CONFIG.GRANT_TYPE,
        client_id: OAUTH_CONFIG.CLIENT_ID,
        client_secret: OAUTH_CONFIG.CLIENT_SECRET,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
        code: code
    });
    
    return `${OAUTH_CONFIG.TOKEN_URL}?${params.toString()}`;
}

// 构建用户信息URL
function buildProfileUrl(accessToken) {
    return `${OAUTH_CONFIG.PROFILE_URL}?access_token=${accessToken}`;
}

// 构建登出URL
function buildLogoutUrl(serviceUrl = null) {
    if (serviceUrl) {
        return `${OAUTH_CONFIG.LOGOUT_URL}?service=${encodeURIComponent(serviceUrl)}`;
    }
    return OAUTH_CONFIG.LOGOUT_URL;
}

// 生成随机state参数
function generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 验证state参数
function validateState(originalState, receivedState) {
    return originalState === receivedState;
}

// 检查令牌是否即将过期
function isTokenExpiringSoon(expiresAt) {
    if (!expiresAt) return true;
    const now = Date.now();
    const threshold = OAUTH_CONFIG.TOKEN_REFRESH_THRESHOLD;
    return (expiresAt - now) < threshold;
}

// 导出配置和工具函数
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        OAUTH_CONFIG,
        buildAuthorizeUrl,
        buildTokenUrl,
        buildProfileUrl,
        buildLogoutUrl,
        generateState,
        validateState,
        isTokenExpiringSoon
    };
} else {
    // 浏览器环境
    window.OAUTH_CONFIG = OAUTH_CONFIG;
    window.buildAuthorizeUrl = buildAuthorizeUrl;
    window.buildTokenUrl = buildTokenUrl;
    window.buildProfileUrl = buildProfileUrl;
    window.buildLogoutUrl = buildLogoutUrl;
    window.generateState = generateState;
    window.validateState = validateState;
    window.isTokenExpiringSoon = isTokenExpiringSoon;
}
