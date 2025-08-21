const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    
    // 验证请求体
    if (!requestBody || !requestBody.input || !requestBody.input.messages) {
      console.error('Invalid request body:', requestBody);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    // 从环境变量获取API Key
    const apiKey = process.env.QWEN_API_KEY || "sk-9fb5bfd2c28c41d48324fef824e9c4e3";
    const apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
    
    // 使用阿里云API的正确格式
    const payload = {
      model: requestBody.model || "qwen-turbo",
      input: {
        messages: requestBody.input.messages
      },
      parameters: {
        result_format: "message"
      }
    };
    
    // 添加调试日志
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));
    console.log('Formatted request body:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('API response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('API error:', result);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(result)
      };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedResult)
    };
  } catch (error) {
    console.error('API proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API request failed', details: error.message })
    };
  }
};
