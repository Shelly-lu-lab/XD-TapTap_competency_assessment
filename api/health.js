module.exports = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasQwenApiKey: !!process.env.QWEN_API_KEY,
      qwenApiKeyLength: process.env.QWEN_API_KEY ? process.env.QWEN_API_KEY.length : 0
    },
    headers: req.headers,
    method: req.method,
    url: req.url
  });
};
