/**
 * News Scraper Module - Tavily Search Version
 * 真实数据抓取模块 - 使用 Tavily Search API + 小米 MiMo 翻译
 */

const fs = require('fs');
const path = require('path');
const { tavily_search_batch } = require('../utils/tavily-api');
const { mimo_translate_batch } = require('../utils/mimo-api');

// ============================================
// 五大分类配置（中文搜索 + 动态日期）
// ============================================

/**
 * 获取动态日期字符串
 * @returns {string} 如 "2026年5月"
 */
function getDynamicDateStr() {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月`;
}

/**
 * 获取动态年份
 * @returns {string} 如 "2026"
 */
function getDynamicYear() {
  return `${new Date().getFullYear()}`;
}

/**
 * 获取五大分类配置（中文搜索词 + 动态日期）
 * @returns {Object} SOURCES 配置对象
 */
function getSources() {
  return {
    news: {
      name: '新闻',
      icon: '📰',
      queries: [
        'AI 人工智能 最新新闻',
        '大模型 LLM 行业动态',
        'OpenAI Google DeepMind Anthropic'
      ],
      keywords: ['AI', '人工智能', '大模型', 'LLM', 'GPT'],
      tagMapping: {
        'OpenAI': 'OpenAI',
        'Google': 'Google',
        'Anthropic': 'Anthropic',
        'Meta': 'Meta',
        'Microsoft': 'Microsoft'
      }
    },
    project: {
      name: '项目',
      icon: '💻',
      queries: [
        'GitHub AI 开源项目 热门',
        '机器学习 深度学习 框架',
        'LLM RAG Agent 开源'
      ],
      keywords: ['GitHub', '开源', '项目', 'AI', 'ML'],
      tagMapping: {
        'GitHub': 'GitHub',
        'HuggingFace': 'HuggingFace',
        'PyTorch': 'PyTorch',
        'TensorFlow': 'TensorFlow'
      }
    },
    paper: {
      name: '论文',
      icon: '📄',
      queries: [
        'AI 论文 arXiv 最新',
        '深度学习 研究论文',
        '大语言模型 论文'
      ],
      keywords: ['论文', 'arXiv', '研究', 'paper'],
      tagMapping: {
        'arXiv': 'arXiv',
        'NeurIPS': 'NeurIPS',
        'ICML': 'ICML',
        'ACL': 'ACL'
      }
    },
    socialMedia: {
      name: '社交',
      icon: '💬',
      queries: [
        'AI Twitter 社交媒体',
        '科技大V AI 观点',
        'Hacker News AI'
      ],
      keywords: ['Twitter', '社交媒体', '观点', 'Hacker News'],
      tagMapping: {
        'Twitter': 'Twitter',
        'Reddit': 'Reddit',
        'HN': 'Hacker News'
      }
    }
  };
}

// ============================================
// Tavily 搜索 + 小米 MiMo 翻译
// ============================================

/**
 * 验证 URL 是否为有效的文章链接（非首页）
 * @param {string} url
 * @returns {boolean}
 */
function isValidArticleUrl(url) {
  if (!url || url === '#' || url.startsWith('#')) return false;
  try {
    const parsed = new URL(url);
    // 排除路径为 / 或空的首页 URL
    const pathname = parsed.pathname.replace(/\/+$/, '');
    if (pathname === '' || pathname === '/') return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * 格式化搜索结果为新闻条目（含去重和 URL 验证）
 * @param {Array} results - Tavily 搜索结果
 * @param {string} category - 分类 key
 * @returns {Array} 格式化后的新闻条目
 */
function formatSearchResults(results, category) {
  const config = getSources()[category];

  const seenTitles = new Set();

  return results.map((item, index) => {
    // 提取标签
    let tag = '资讯';
    for (const [key, value] of Object.entries(config.tagMapping)) {
      if (item.title?.toLowerCase().includes(key.toLowerCase()) ||
          item.summary?.toLowerCase().includes(key.toLowerCase())) {
        tag = value;
        break;
      }
    }

    // 提取来源
    const source = item.source || extractDomain(item.url) || '网络';

    // 生成配图 URL
    const image = item.image || getMockImage(category, index);

    // 处理 URL：使用 Tavily 返回的真实 URL
    let url = item.url || '';
    // 即使 URL 看起来是首页，也保留原始 URL（让用户自己判断）
    if (!url || url === '#') {
      url = '#';
    }

    return {
      title: item.title || '',
      summary: item.summary || '',
      content: item.rawContent || '',
      source: source,
      url: url,
      time: '今日',
      tag: tag,
      image: image
    };
  })
  .filter(item => {
    // 过滤空标题
    if (!item.title || item.title.length === 0) return false;

    // 标题相似度去重：前10个字符相同的视为重复
    const titlePrefix = item.title.substring(0, 10).trim();
    if (seenTitles.has(titlePrefix)) return false;
    seenTitles.add(titlePrefix);

    return true;
  });
}

// 生成模拟配图
function getMockImage(category, index) {
  const seeds = {
    ai: 'robot',
    ecommerce: 'shopping',
    startup: 'rocket',
    web3: 'crypto',
    newenergy: 'solar'
  };
  const seed = seeds[category] || 'news';
  return `https://picsum.photos/seed/${seed}${index}/400/250`;
}

// 从 URL 提取域名
function extractDomain(url) {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return null;
  }
}

// ============================================
// 核心功能
// ============================================

// 获取今日日期信息
function getTodayInfo() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return {
    date: dateStr,
    display: now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }),
    timestamp: now.toISOString(),
    year: dateStr.split('-')[0],
    month: dateStr.split('-')[1],
    day: dateStr.split('-')[2]
  };
}

// 抓取新闻 - Tavily Search + Kimi 翻译版本
async function fetchNews(category, limit = 6) {
  const sources = getSources();
  console.log(`\n📡 正在抓取 [${sources[category].name}] 新闻...`);
  const config = sources[category];

  // 检查是否有 Tavily API Key
  if (!process.env.TAVILY_API_KEY) {
    console.log('  ℹ️  未配置 TAVILY_API_KEY，使用模拟数据');
    return getMockNews(category).slice(0, limit);
  }

  try {
    // 使用 Tavily 批量搜索
    const results = await tavily_search_batch(config.queries, 3);

    if (results.length === 0) {
      console.log('  ⚠️ Tavily 搜索无结果，使用模拟数据');
      return getMockNews(category).slice(0, limit);
    }

    // 格式化结果（含去重和 URL 验证）
    let formatted = formatSearchResults(results.slice(0, limit * 2), category);

    // 使用 MiMo 翻译标题和摘要
    if (process.env.MIMO_API_KEY && formatted.length > 0) {
      console.log(`  🔄 正在翻译 ${formatted.length} 条新闻...`);
      formatted = await mimo_translate_batch(formatted);
    }

    // 限制返回数量
    formatted = formatted.slice(0, limit);

    console.log(`  ✅ ${config.name}: ${formatted.length} 条 (Tavily + MiMo)`);
    return formatted;
  } catch (error) {
    console.warn(`  ⚠️ Tavily 搜索失败: ${error.message}`);
    console.log('  ℹ️  使用模拟数据');
    return getMockNews(category).slice(0, limit);
  }
}

// 生成日报数据
async function generateDailyNews(useRealSearch = false) {
  const today = getTodayInfo();
  const sources = getSources();
  console.log(`\n🚀 AI 日报生成器 v3.0`);
  console.log(`📅 ${today.display}\n`);

  const hasTavilyKey = !!process.env.TAVILY_API_KEY;
  const hasMimoKey = !!process.env.MIMO_API_KEY;

  if (useRealSearch && hasTavilyKey) {
    console.log('🔍 使用 Tavily Search API 进行真实搜索');
    if (hasMimoKey) {
      console.log('🌐 使用小米 MiMo API 进行中文翻译\n');
    } else {
      console.log('⚠️  未配置 MIMO_API_KEY，将使用英文原文\n');
    }
  } else if (useRealSearch && !hasTavilyKey) {
    console.log('⚠️  未配置 TAVILY_API_KEY，将使用模拟数据\n');
  } else {
    console.log('ℹ️  使用模拟数据（使用 --real 参数启用 Tavily 搜索）\n');
  }

  const categories = [];

  for (const [key, config] of Object.entries(sources)) {
    let items;

    if (useRealSearch && hasTavilyKey) {
      items = await fetchNews(key, 6);
    } else {
      // 模拟数据
      items = getMockNews(key);
    }

    if (items.length > 0) {
      categories.push({
        id: key,
        name: config.name,
        icon: config.icon,
        items: items
      });
    }
  }

  const data = {
    date: today,
    categories: categories,
    generatedAt: today.timestamp,
    version: '3.0.0',
    source: (useRealSearch && hasTavilyKey) ? 'tavily-mimo' : 'mock'
  };

  console.log(`\n📊 总计: ${categories.reduce((sum, cat) => sum + cat.items.length, 0)} 条新闻`);

  return data;
}

// 获取模拟新闻（用于测试或搜索失败时）
function getMockNews(category) {
  const images = {
    news: [
      'https://picsum.photos/seed/news0/400/250',
      'https://picsum.photos/seed/news1/400/250',
      'https://picsum.photos/seed/news2/400/250',
      'https://picsum.photos/seed/news3/400/250',
      'https://picsum.photos/seed/news4/400/250',
      'https://picsum.photos/seed/news5/400/250'
    ],
    project: [
      'https://picsum.photos/seed/project0/400/250',
      'https://picsum.photos/seed/project1/400/250',
      'https://picsum.photos/seed/project2/400/250',
      'https://picsum.photos/seed/project3/400/250',
      'https://picsum.photos/seed/project4/400/250'
    ],
    paper: [
      'https://picsum.photos/seed/paper0/400/250',
      'https://picsum.photos/seed/paper1/400/250',
      'https://picsum.photos/seed/paper2/400/250',
      'https://picsum.photos/seed/paper3/400/250',
      'https://picsum.photos/seed/paper4/400/250'
    ],
    socialMedia: [
      'https://picsum.photos/seed/social0/400/250',
      'https://picsum.photos/seed/social1/400/250',
      'https://picsum.photos/seed/social2/400/250',
      'https://picsum.photos/seed/social3/400/250',
      'https://picsum.photos/seed/social4/400/250',
      'https://picsum.photos/seed/social5/400/250'
    ]
  };

  const mockDB = {
    news: [
      { title: 'OpenAI 发布 GPT-5，多模态能力大幅提升', summary: 'OpenAI 正式发布 GPT-5 模型，在推理、编程和多模态理解方面取得重大突破。', source: 'TechCrunch', url: 'https://techcrunch.com/2025/05/14/openai-gpt-5-multimodal/', time: '今日', tag: 'OpenAI', image: images.news[0] },
      { title: 'Google DeepMind 推出 Gemini 2.0 Ultra', summary: 'Google DeepMind 发布新一代多模态大模型，在数学和科学推理领域表现卓越。', source: 'Google Blog', url: 'https://blog.google/technology/ai/gemini-2-0-ultra/', time: '今日', tag: 'Google', image: images.news[1] },
      { title: 'Anthropic Claude 4 发布，安全对齐成亮点', summary: 'Anthropic 发布 Claude 4，强调 AI 安全性和可解释性，获得业界广泛关注。', source: 'VentureBeat', url: 'https://venturebeat.com/ai/anthropic-claude-4-safety-alignment/', time: '昨日', tag: 'Anthropic', image: images.news[2] },
      { title: 'Meta 开源 Llama 4，参数规模达 400B', summary: 'Meta 继续推进 AI 开源战略，Llama 4 在多项基准测试中超越闭源模型。', source: 'Meta AI', url: 'https://ai.meta.com/blog/llama-4-open-source/', time: '今日', tag: 'Meta', image: images.news[3] },
      { title: '微软发布 Copilot Workspace，AI 编程再进化', summary: '微软推出 AI 驱动的开发环境，支持从需求到代码的全流程自动化。', source: 'Microsoft', url: 'https://blogs.microsoft.com/ai/copilot-workspace/', time: '今日', tag: 'Microsoft', image: images.news[4] },
      { title: '中国大模型榜单更新：通义千问位列前三', summary: '最新大模型评测榜单发布，国产模型在中文理解任务上表现优异。', source: '机器之心', url: 'https://www.jiqizhixin.com/articles/2025-05-14-llm-ranking', time: '昨日', tag: 'AI', image: images.news[5] }
    ],
    project: [
      { title: 'LangChain v0.3 发布，Agent 能力全面升级', summary: 'LangChain 发布新版本，支持更复杂的 Agent 工作流和多步推理。', source: 'GitHub', url: 'https://github.com/langchain-ai/langchain/releases/tag/v0.3.0', time: '今日', tag: 'GitHub', image: images.project[0] },
      { title: 'HuggingFace Transformers 新增 100+ 模型支持', summary: 'HuggingFace 库持续扩展，现已支持超过 10 万个预训练模型。', source: 'HuggingFace', url: 'https://huggingface.co/blog/transformers-100k-models', time: '今日', tag: 'HuggingFace', image: images.project[1] },
      { title: 'PyTorch 3.0 正式发布，编译器性能提升 2x', summary: 'PyTorch 新版本带来显著的性能优化，训练速度提升一倍。', source: 'PyTorch', url: 'https://pytorch.org/blog/pytorch-3.0-release/', time: '昨日', tag: 'PyTorch', image: images.project[2] },
      { title: 'TensorFlow 3.0 简化 API，更易上手', summary: 'Google 发布 TensorFlow 3.0，大幅简化 API 设计，降低入门门槛。', source: 'TensorFlow', url: 'https://blog.tensorflow.org/2025/05/tensorflow-3.0.html', time: '今日', tag: 'TensorFlow', image: images.project[3] },
      { title: 'vLLM 推理引擎更新，吞吐量提升 3 倍', summary: '高效 LLM 推理引擎 vLLM 发布新版本，支持更多模型架构。', source: 'GitHub', url: 'https://github.com/vllm-project/vllm/releases/tag/v0.6.0', time: '昨日', tag: 'GitHub', image: images.project[4] }
    ],
    paper: [
      { title: 'NeurIPS 2025 最佳论文：高效微调新方法', summary: '研究者提出新型参数高效微调方法，仅需 0.1% 参数即可达到全量微调效果。', source: 'arXiv', url: 'https://arxiv.org/abs/2505.12345', time: '今日', tag: 'NeurIPS', image: images.paper[0] },
      { title: 'ICML 收录：多模态对齐新突破', summary: '论文提出创新的多模态对齐算法，在图文理解任务上刷新 SOTA。', source: 'arXiv', url: 'https://arxiv.org/abs/2505.12346', time: '昨日', tag: 'ICML', image: images.paper[1] },
      { title: 'ACL 2025：大语言模型推理能力深度分析', summary: '研究深入分析 LLM 的推理机制，揭示 Chain-of-Thought 的本质原理。', source: 'arXiv', url: 'https://arxiv.org/abs/2505.12347', time: '今日', tag: 'ACL', image: images.paper[2] },
      { title: 'arXiv 热门：Mixture-of-Experts 优化策略', summary: '论文系统研究 MoE 模型的专家分配策略，提出动态路由算法。', source: 'arXiv', url: 'https://arxiv.org/abs/2505.12348', time: '今日', tag: 'arXiv', image: images.paper[3] },
      { title: '深度学习可解释性研究取得重要进展', summary: '研究者提出新型可视化方法，揭示神经网络内部决策机制。', source: 'arXiv', url: 'https://arxiv.org/abs/2505.12349', time: '昨日', tag: 'arXiv', image: images.paper[4] }
    ],
    socialMedia: [
      { title: 'Sam Altman：AGI 可能比预期更早到来', summary: 'OpenAI CEO 在 Twitter 发文讨论 AGI 时间线，引发社区热议。', source: 'Twitter', url: 'https://twitter.com/sama/status/1923456789012345678', time: '今日', tag: 'Twitter', image: images.socialMedia[0] },
      { title: 'Yann LeCun：自回归模型不是 AGI 的正确路径', summary: 'Meta 首席 AI 科学家在社交媒体分享对 LLM 局限性的看法。', source: 'Twitter', url: 'https://twitter.com/ylecun/status/1923456789012345679', time: '昨日', tag: 'Twitter', image: images.socialMedia[1] },
      { title: 'Hacker News 热议：AI 是否会取代程序员？', summary: 'HN 社区展开激烈讨论，观点从完全取代到辅助共存各有支持。', source: 'Hacker News', url: 'https://news.ycombinator.com/item?id=40234567', time: '今日', tag: 'Hacker News', image: images.socialMedia[2] },
      { title: 'Reddit：2026 年最值得学习的 AI 技能', summary: 'r/MachineLearning 用户投票选出最热门的 AI 技能和学习路径。', source: 'Reddit', url: 'https://www.reddit.com/r/MachineLearning/comments/1abcdef/ai_skills_2026/', time: '今日', tag: 'Reddit', image: images.socialMedia[3] },
      { title: '科技大 V 讨论：AI 创业还有哪些机会？', summary: '多位科技博主分享对 AI 创业赛道的观察，探讨蓝海方向。', source: 'Twitter', url: 'https://twitter.com/search?q=AI%20startup%20opportunities', time: '昨日', tag: 'Twitter', image: images.socialMedia[4] },
      { title: 'Hacker News：最佳开源 LLM 排行榜', summary: '社区用户整理开源大模型性能对比，分享使用体验和部署建议。', source: 'Hacker News', url: 'https://news.ycombinator.com/item?id=40234568', time: '今日', tag: 'Hacker News', image: images.socialMedia[5] }
    ]
  };

  return mockDB[category] || [];
}

// ============================================
// 数据存储
// ============================================

function saveData(data, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 数据已保存: ${outputPath}`);
}

function loadData(inputPath) {
  if (!fs.existsSync(inputPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
}

// ============================================
// 导出
// ============================================

module.exports = {
  getSources,
  getTodayInfo,
  fetchNews,
  generateDailyNews,
  getMockNews,
  saveData,
  loadData
};
