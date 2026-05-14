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
  const dateStr = getDynamicDateStr();
  const year = getDynamicYear();

  return {
    ai: {
      name: 'AI 人工智能',
      icon: '🤖',
      queries: [
        `AI 大模型 最新进展 ${dateStr}`,
        `人工智能 科技新闻 今日热点`,
        `LLM GPT Claude Gemini 最新动态`,
        `OpenAI Anthropic Google DeepMind AI 新闻`,
        `AI 智能体 具身智能 机器人 ${year}`
      ],
      keywords: ['AI', '人工智能', '大模型', 'ChatGPT', 'Claude', 'OpenAI', '机器人', '智能体'],
      tagMapping: {
        'OpenAI': 'OpenAI',
        'Google': 'Google',
        'Anthropic': 'Claude',
        'Meta': 'Meta',
        'Microsoft': 'Microsoft',
        'NVIDIA': 'NVIDIA',
        'agent': 'Agent',
        '智能体': 'Agent',
        '机器人': '机器人',
        '大模型': '大模型'
      }
    },
    ecommerce: {
      name: '跨境电商',
      icon: '🌍',
      queries: [
        `跨境电商 最新资讯 ${dateStr}`,
        `SHEIN Temu TikTok Shop 出海动态`,
        `DTC 独立站 国际化 跨境`,
        `跨境电商 物流 供应链 政策`,
        `亚马逊 全球开店 出海 ${year}`
      ],
      keywords: ['跨境电商', '出海', 'SHEIN', 'Temu', '亚马逊', '独立站', 'DTC'],
      tagMapping: {
        'SHEIN': 'SHEIN',
        'Temu': 'Temu',
        'TikTok': 'TikTok',
        'Amazon': 'Amazon',
        'Shopify': 'Shopify',
        '亚马逊': 'Amazon'
      }
    },
    startup: {
      name: '产品创业',
      icon: '💡',
      queries: [
        `创业融资 最新消息 ${dateStr}`,
        `SaaS 产品增长 创业新闻`,
        `科技创业 投资 A轮 B轮`,
        `独角兽 IPO 收购 ${year}`,
        `YC Y Combinator 创业项目 融资`
      ],
      keywords: ['创业', '融资', '独角兽', 'SaaS', 'PMF', '增长', '投资'],
      tagMapping: {
        'YC': 'YC',
        'Y Combinator': 'YC',
        'seed': '种子轮',
        '种子轮': '种子轮',
        'Series A': 'A轮',
        'A轮': 'A轮',
        'Series B': 'B轮',
        'B轮': 'B轮',
        'IPO': 'IPO'
      }
    },
    web3: {
      name: '区块链 Web3',
      icon: '⛓️',
      queries: [
        `加密货币 比特币 以太坊 最新新闻 ${dateStr}`,
        `DeFi Web3 区块链 动态`,
        `加密 ETF 机构投资 监管`,
        `NFT 元宇宙 数字资产`,
        `比特币 减半 行情 ${year}`
      ],
      keywords: ['区块链', 'Web3', '加密货币', '比特币', '以太坊', 'DeFi', 'NFT', '元宇宙'],
      tagMapping: {
        'Bitcoin': 'BTC',
        'BTC': 'BTC',
        '比特币': 'BTC',
        'Ethereum': 'ETH',
        'ETH': 'ETH',
        '以太坊': 'ETH',
        'Solana': 'SOL',
        'DeFi': 'DeFi',
        'NFT': 'NFT',
        'ETF': 'ETF'
      }
    },
    newenergy: {
      name: '新能源',
      icon: '⚡',
      queries: [
        `电动汽车 新能源车 最新消息 ${dateStr}`,
        `电池技术 储能 固态电池`,
        `光伏 风电 可再生能源`,
        `特斯拉 比亚迪 宁德时代 动态`,
        `碳中和 碳交易 新能源政策 ${year}`
      ],
      keywords: ['新能源', '电动车', '储能', '电池', '碳中和', '光伏', '氢能'],
      tagMapping: {
        'Tesla': 'Tesla',
        '特斯拉': 'Tesla',
        'BYD': 'BYD',
        '比亚迪': 'BYD',
        'CATL': 'CATL',
        '宁德时代': 'CATL',
        '固态电池': '固态电池',
        'solid-state': '固态电池',
        '光伏': '光伏',
        '氢能': '氢能'
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

    // 处理 URL：验证有效性，无效时使用 Google 搜索链接作为 fallback
    let url = item.url || '';
    if (!isValidArticleUrl(url)) {
      // URL 无效时，用标题生成 Google 搜索链接
      url = `https://www.google.com/search?q=${encodeURIComponent(item.title || '')}`;
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
    ai: [
      'https://picsum.photos/seed/ai0/400/250',
      'https://picsum.photos/seed/ai1/400/250',
      'https://picsum.photos/seed/ai2/400/250',
      'https://picsum.photos/seed/ai3/400/250',
      'https://picsum.photos/seed/ai4/400/250',
      'https://picsum.photos/seed/ai5/400/250'
    ],
    ecommerce: [
      'https://picsum.photos/seed/shop0/400/250',
      'https://picsum.photos/seed/shop1/400/250',
      'https://picsum.photos/seed/shop2/400/250',
      'https://picsum.photos/seed/shop3/400/250'
    ],
    startup: [
      'https://picsum.photos/seed/rocket0/400/250',
      'https://picsum.photos/seed/rocket1/400/250',
      'https://picsum.photos/seed/rocket2/400/250'
    ],
    web3: [
      'https://picsum.photos/seed/crypto0/400/250',
      'https://picsum.photos/seed/crypto1/400/250',
      'https://picsum.photos/seed/crypto2/400/250',
      'https://picsum.photos/seed/crypto3/400/250',
      'https://picsum.photos/seed/crypto4/400/250'
    ],
    newenergy: [
      'https://picsum.photos/seed/energy0/400/250',
      'https://picsum.photos/seed/energy1/400/250',
      'https://picsum.photos/seed/energy2/400/250',
      'https://picsum.photos/seed/energy3/400/250',
      'https://picsum.photos/seed/energy4/400/250',
      'https://picsum.photos/seed/energy5/400/250'
    ]
  };

  /**
   * 生成 Google 搜索链接
   * @param {string} title - 新闻标题
   * @returns {string} Google 搜索 URL
   */
  function googleSearchUrl(title) {
    return `https://www.google.com/search?q=${encodeURIComponent(title)}`;
  }

  const mockDB = {
    ai: [
      { title: '越南《人工智能法》正式生效，成东南亚首个 AI 专门立法国家', summary: '越南于3月1日正式实施《人工智能法》，标志着东盟 AI 治理进入新阶段。', source: '环球时报', url: googleSearchUrl('越南《人工智能法》正式生效，成东南亚首个 AI 专门立法国家'), time: '今日', tag: '政策', image: images.ai[0] },
      { title: '荣耀发布机器人手机，AI 从"云端对话"走向"端侧执行"', summary: 'MWC 2026 上，荣耀推出融合具身智能的机器人手机，被视为 AI 智能体重要入口。', source: '新华网', url: googleSearchUrl('荣耀发布机器人手机 AI 端侧执行'), time: '今日', tag: '产品', image: images.ai[1] },
      { title: '阿里千问大模型负责人林俊旸卸任', summary: '阿里巴巴最年轻 P10 级技术专家宣布离开千问团队，折射 AI 人才高流动性。', source: '上观新闻', url: googleSearchUrl('阿里千问大模型负责人林俊旸卸任'), time: '今日', tag: '人事', image: images.ai[2] },
      { title: '黄仁勋：300 亿投资 OpenAI"可能是最后一次"', summary: '英伟达 CEO 表示，随着 OpenAI 准备上市，近期 300 亿美元投资可能是最后一次。', source: '新浪财经', url: googleSearchUrl('黄仁勋 300亿投资 OpenAI'), time: '今日', tag: '融资', image: images.ai[3] },
      { title: '蚂蚁集团联合清华发布 AReaL v1.0 强化学习框架', summary: '首个全异步训推解耦的大模型强化学习训练系统，让智能体强化学习开箱即用。', source: '科创板日报', url: googleSearchUrl('蚂蚁集团 清华 AReaL 强化学习框架'), time: '昨日', tag: '开源', image: images.ai[4] },
      { title: '我国首个国家级人形机器人标准体系发布', summary: '我国首个国家级"人形机器人与具身智能标准体系"正式发布。', source: '软盟资讯', url: googleSearchUrl('国家级人形机器人标准体系发布'), time: '3月2日', tag: '标准', image: images.ai[5] }
    ],
    ecommerce: [
      { title: '深圳华强北发布 AI 硬件全球销售热力图', summary: '2026年1-2月数据显示，无人机海内外市场需求保持旺盛。', source: '新华社', url: googleSearchUrl('深圳华强北 AI 硬件全球销售热力图'), time: '今日', tag: '数据', image: images.ecommerce[0] },
      { title: '雷军两会建议：提高人形机器人使用率', summary: '小米 CEO 提出 5 份建议，涉及智能制造应用和人才培养。', source: 'IT之家', url: googleSearchUrl('雷军两会建议 人形机器人'), time: '今日', tag: '政策', image: images.ecommerce[1] },
      { title: '华为发布 Atlas 950 SuperPoD', summary: 'MWC 2026 期间，华为发布多款超节点产品，助力运营商智能化升级。', source: '华为官网', url: googleSearchUrl('华为发布 Atlas 950 SuperPoD'), time: '昨日', tag: '产品', image: images.ecommerce[2] },
      { title: '千问"一句话下单"功能 DAU 突破 7300 万', summary: '超过 400 万 60 岁以上新用户通过 AI 完成外卖下单。', source: '新浪财经', url: googleSearchUrl('千问一句话下单 DAU 7300万'), time: '今日', tag: '数据', image: images.ecommerce[3] }
    ],
    startup: [
      { title: 'OpenAI 完成 1100 亿美元新一轮融资', summary: '该轮融资包括英伟达、亚马逊和软银的投资承诺。', source: '彭博社', url: googleSearchUrl('OpenAI 1100亿美元 新一轮融资'), time: '今日', tag: '融资', image: images.startup[0] },
      { title: '北京数据和人工智能安全检测中心揭牌', summary: 'AI 产业迎来专业鉴定机构，七大创新成果发布。', source: '北京日报', url: googleSearchUrl('北京数据和人工智能安全检测中心揭牌'), time: '3月2日', tag: '政策', image: images.startup[1] },
      { title: 'Honor 推出全球首款机器人手机', summary: '荣耀 CEO 表示，这是智能手机的"全新物种"。', source: 'MWC 2026', url: googleSearchUrl('Honor 全球首款机器人手机'), time: '今日', tag: '创新', image: images.startup[2] }
    ],
    web3: [
      { title: '比特币 ETF 资金流入创新高，机构配置加速', summary: '美国比特币 ETF 单日净流入超 10 亿美元，显示机构投资者持续加仓。', source: 'CoinDesk', url: googleSearchUrl('比特币 ETF 资金流入创新高'), time: '今日', tag: 'BTC', image: images.web3[0] },
      { title: '以太坊 Dencun 升级完成，Layer2 费用大幅下降', summary: '升级引入 EIP-4844，使 Layer2 交易费用降低 90% 以上。', source: 'The Block', url: googleSearchUrl('以太坊 Dencun 升级 Layer2 费用下降'), time: '今日', tag: 'ETH', image: images.web3[1] },
      { title: '香港证监会批准首批现货加密 ETF', summary: '香港正式批准比特币和以太坊现货 ETF，预计 4 月上市交易。', source: '南华早报', url: googleSearchUrl('香港证监会 批准 现货加密 ETF'), time: '昨日', tag: 'ETF', image: images.web3[2] },
      { title: 'DeFi 协议总锁仓量突破 1000 亿美元', summary: '受市场回暖带动，DeFi 生态 TVL 创下近两年新高。', source: 'DeFiLlama', url: googleSearchUrl('DeFi 协议总锁仓量突破1000亿美元'), time: '今日', tag: 'DeFi', image: images.web3[3] },
      { title: '央行数字货币跨境支付试点扩大', summary: '数字人民币跨境支付试点新增 5 个国家和地区。', source: '财新', url: googleSearchUrl('央行数字货币跨境支付试点扩大'), time: '3月3日', tag: 'CBDC', image: images.web3[4] }
    ],
    newenergy: [
      { title: '宁德时代发布新一代固态电池技术', summary: '能量密度突破 500Wh/kg，预计 2027 年量产装车。', source: '证券时报', url: googleSearchUrl('宁德时代 新一代固态电池技术'), time: '今日', tag: '固态电池', image: images.newenergy[0] },
      { title: '特斯拉上海储能超级工厂投产', summary: '年产能 40GWh，产品将面向全球市场供应。', source: '澎湃新闻', url: googleSearchUrl('特斯拉上海储能超级工厂投产'), time: '今日', tag: 'Tesla', image: images.newenergy[1] },
      { title: '全国碳市场扩容，纳入钢铁水泥行业', summary: '碳交易市场覆盖范围扩大，推动高耗能行业绿色转型。', source: '生态环境部', url: googleSearchUrl('全国碳市场扩容 钢铁水泥'), time: '昨日', tag: '碳中和', image: images.newenergy[2] },
      { title: '光伏组件出口量同比增长 35%', summary: '中国光伏产品海外需求持续旺盛，欧洲和新兴市场为主要增长点。', source: '光伏們', url: googleSearchUrl('光伏组件出口量同比增长35%'), time: '今日', tag: '光伏', image: images.newenergy[3] },
      { title: '氢能源重卡商业化运营启动', summary: '首批 100 辆氢燃料电池重卡投入物流干线运营。', source: '中国汽车报', url: googleSearchUrl('氢能源重卡商业化运营启动'), time: '3月2日', tag: '氢能', image: images.newenergy[4] },
      { title: '比亚迪发布第五代 DM 混动技术', summary: '百公里油耗降至 2.9L，综合续航超 2000 公里。', source: '比亚迪', url: googleSearchUrl('比亚迪 第五代 DM 混动技术'), time: '今日', tag: 'BYD', image: images.newenergy[5] }
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
