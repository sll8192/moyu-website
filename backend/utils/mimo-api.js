/**
 * MiMo API 工具（小米大模型）
 * 封装 MiMo 翻译调用，兼容 OpenAI API 格式
 */

const https = require('https');

const MIMO_API_KEY = process.env.MIMO_API_KEY || '';
const MIMO_API_BASE = 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';

/**
 * 使用 MiMo 翻译文本
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言，默认中文
 * @returns {Promise<string>} 翻译后的文本
 */
async function mimo_translate(text, targetLang = '中文') {
  const apiKey = process.env.MIMO_API_KEY || MIMO_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ MIMO_API_KEY 未配置，返回原文');
    return text;
  }

  if (!text || text.trim() === '') {
    return text;
  }

  const requestBody = {
    model: 'MiMo-V2.5-Pro',
    messages: [
      {
        role: 'system',
        content: `你是一个专业的新闻翻译专家。请将以下英文内容翻译成${targetLang}，要求：
1. 翻译要准确、流畅、符合中文表达习惯
2. 保留专有名词、公司名、产品名等英文原名
3. 只输出翻译结果，不要添加任何解释`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3
  };

  const data = JSON.stringify(requestBody);

  const url = new URL(MIMO_API_BASE);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);

          if (parsedData.error) {
            console.error(`[MiMo] API 错误: ${parsedData.error.message || JSON.stringify(parsedData.error)}`);
            resolve(text);
            return;
          }

          const translated = parsedData.choices?.[0]?.message?.content?.trim() || text;
          resolve(translated);
        } catch (error) {
          console.error(`[MiMo] 解析失败: ${error.message}`);
          resolve(text);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[MiMo] 请求失败: ${error.message}`);
      resolve(text);
    });

    req.write(data);
    req.end();
  });
}

/**
 * 批量翻译新闻条目（逐条翻译，确保准确率）
 * @param {Array} items - 新闻条目数组，每项包含 title、summary 和 content
 * @returns {Promise<Array>} 翻译后的新闻条目
 */
async function mimo_translate_batch(items) {
  const apiKey = process.env.MIMO_API_KEY || MIMO_API_KEY;
  if (!apiKey || !items || items.length === 0) {
    return items;
  }

  console.log(`  🔄 MiMo 正在翻译 ${items.length} 条新闻...`);
  const translatedItems = [];

  for (const item of items) {
    try {
      const translatedTitle = await translateText(item.title, apiKey);
      const summaryToTranslate = item.summary?.substring(0, 500) || '';
      const translatedSummary = await translateText(summaryToTranslate, apiKey);
      const contentToTranslate = (item.content || '').substring(0, 2000) || '';
      const translatedContent = await translateText(contentToTranslate, apiKey);

      translatedItems.push({
        ...item,
        title: translatedTitle || item.title,
        summary: translatedSummary?.substring(0, 100) || item.summary?.substring(0, 100) || '',
        content: translatedContent || item.content || ''
      });

      await new Promise(r => setTimeout(r, 300));
    } catch (error) {
      console.error(`[MiMo] 翻译失败: ${error.message}`);
      translatedItems.push(item);
    }
  }

  return translatedItems;
}

/**
 * 翻译单条文本
 */
async function translateText(text, apiKey) {
  if (!text || text.trim() === '' || isChineseText(text)) {
    return text;
  }

  const requestBody = {
    model: 'MiMo-V2.5-Pro',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的科技新闻翻译专家。请将英文翻译成简洁的中文。要求：1.翻译准确流畅 2.保留英文专有名词（公司名、产品名、人名等） 3.只输出翻译结果，不要解释 4.对于长文本内容，要优化排版：- 合理分段，每段不超过3行 - 使用简洁的语言 - 去除冗余信息 - 保持逻辑清晰'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.3
  };

  const data = JSON.stringify(requestBody);

  const url = new URL(MIMO_API_BASE);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          const translated = parsedData.choices?.[0]?.message?.content?.trim() || text;
          resolve(translated);
        } catch (error) {
          resolve(text);
        }
      });
    });

    req.on('error', () => resolve(text));
    req.write(data);
    req.end();
  });
}

/**
 * 检测文本是否主要是中文
 */
function isChineseText(text) {
  if (!text) return false;
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  return chineseChars.length > text.length * 0.3;
}

module.exports = {
  mimo_translate,
  mimo_translate_batch
};
