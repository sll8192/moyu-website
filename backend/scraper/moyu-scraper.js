/**
 * 摸鱼内容抓取模块
 * 优先使用真实 API，失败时回退到 Tavily Search 或 mock 数据
 */

const fs = require('fs');
const path = require('path');
const { tavily_search } = require('../utils/tavily-api');
const { fetchAllRealContent } = require('../utils/real-api');

// ============================================
// 四大摸鱼分类配置
// ============================================
const MOYU_SOURCES = {
  funny: {
    name: '搞笑图片',
    icon: '😂',
    queries: [
      'funny memes trending today',
      '搞笑趣图 热门 今日'
    ],
    keywords: ['搞笑', 'meme', '笑话', '趣图', 'funny', 'humor'],
    placeholderImages: [
      'https://picsum.photos/seed/funny1/400/300',
      'https://picsum.photos/seed/funny2/400/300',
      'https://picsum.photos/seed/funny3/400/300',
      'https://picsum.photos/seed/funny4/400/300',
      'https://picsum.photos/seed/funny5/400/300',
      'https://picsum.photos/seed/funny6/400/300'
    ]
  },
  beauty: {
    name: '美女福利',
    icon: '👀',
    queries: [
      'beautiful photography portrait aesthetic',
      '人像摄影 美女 时尚'
    ],
    keywords: ['美女', '摄影', '时尚', '人像', 'beauty', 'portrait', 'photography'],
    placeholderImages: [
      'https://picsum.photos/seed/beauty1/400/500',
      'https://picsum.photos/seed/beauty2/400/500',
      'https://picsum.photos/seed/beauty3/400/500',
      'https://picsum.photos/seed/beauty4/400/500',
      'https://picsum.photos/seed/beauty5/400/500',
      'https://picsum.photos/seed/beauty6/400/500'
    ]
  },
  jokes: {
    name: '内涵段子',
    icon: '🤣',
    queries: [
      'funny jokes humor trending',
      '内涵段子 笑话 精选'
    ],
    keywords: ['段子', '笑话', '幽默', '内涵', 'jokes', 'humor', 'funny'],
    placeholderImages: [
      'https://picsum.photos/seed/joke1/400/250',
      'https://picsum.photos/seed/joke2/400/250',
      'https://picsum.photos/seed/joke3/400/250',
      'https://picsum.photos/seed/joke4/400/250',
      'https://picsum.photos/seed/joke5/400/250',
      'https://picsum.photos/seed/joke6/400/250'
    ]
  },
  qiushi: {
    name: '糗事百科',
    icon: '😅',
    queries: [
      'embarrassing stories funny moments',
      '糗事百科 尴尬 搞笑经历'
    ],
    keywords: ['糗事', '尴尬', '搞笑', '经历', 'embarrassing', 'awkward', 'stories'],
    placeholderImages: [
      'https://picsum.photos/seed/qiushi1/400/300',
      'https://picsum.photos/seed/qiushi2/400/300',
      'https://picsum.photos/seed/qiushi3/400/300',
      'https://picsum.photos/seed/qiushi4/400/300',
      'https://picsum.photos/seed/qiushi5/400/300',
      'https://picsum.photos/seed/qiushi6/400/300'
    ]
  }
};

// ============================================
// 模拟数据（当 API 不可用时使用）
// ============================================
const MOCK_DATA = {
  funny: [
    { title: '程序员的一天', content: '早上：代码能跑；中午：代码不能跑；晚上：代码能跑，但不知道为什么。', image: 'https://picsum.photos/seed/funny1/400/300', likes: 2341 },
    { title: '当代年轻人的钱包', content: '月初：我是有钱人；月中：我是普通人；月末：我是乞丐。', image: 'https://picsum.photos/seed/funny2/400/300', likes: 1892 },
    { title: '减肥的真相', content: '计划：今天开始减肥；现实：今天开始吃遍所有想吃的。', image: 'https://picsum.photos/seed/funny3/400/300', likes: 3421 },
    { title: '开会时的我', content: '表面上：认真记笔记；实际上：画了一整页的乌龟。', image: 'https://picsum.photos/seed/funny4/400/300', likes: 1567 },
    { title: '周末计划', content: '周五晚上：周末要看书、健身、学习；周六：躺平；周日：焦虑地躺平。', image: 'https://picsum.photos/seed/funny5/400/300', likes: 2789 },
    { title: '网购的心理历程', content: '下单时：我需要这个；收货时：我买了什么；一个月后：这玩意在哪？', image: 'https://picsum.photos/seed/funny6/400/300', likes: 2156 }
  ],
  beauty: [
    { title: '清新自然风', content: '阳光正好，微风不燥', image: 'https://picsum.photos/seed/beauty1/400/500', likes: 4521 },
    { title: '都市时尚', content: '街拍时刻，展现自信', image: 'https://picsum.photos/seed/beauty2/400/500', likes: 3892 },
    { title: '优雅气质', content: '简约不简单，气质出众', image: 'https://picsum.photos/seed/beauty3/400/500', likes: 5234 },
    { title: '甜美风格', content: '笑容是最好的妆容', image: 'https://picsum.photos/seed/beauty4/400/500', likes: 4123 },
    { title: '复古风情', content: '经典永不过时', image: 'https://picsum.photos/seed/beauty5/400/500', likes: 3678 },
    { title: '运动活力', content: '健康美，动起来', image: 'https://picsum.photos/seed/beauty6/400/500', likes: 2987 }
  ],
  jokes: [
    { title: '程序员的浪漫', content: '我对你的爱就像循环语句，没有break，只有continue，直到内存溢出。', image: 'https://picsum.photos/seed/joke1/400/250', likes: 1234 },
    { title: '成年人的世界', content: '小时候以为"早睡早起身体好"是个建议，长大后才知道这是三个愿望。', image: 'https://picsum.photos/seed/joke2/400/250', likes: 2345 },
    { title: '职场真相', content: '老板：这个项目很简单；实际：需要学会时光倒流。', image: 'https://picsum.photos/seed/joke3/400/250', likes: 1876 },
    { title: '健身感悟', content: '健身三个月，体重没变，但心态变了——从想瘦变成了想吃。', image: 'https://picsum.photos/seed/joke4/400/250', likes: 2987 },
    { title: '相亲经历', content: '对方问：你有房吗？我说：有，斗地主里还有炸弹呢。', image: 'https://picsum.photos/seed/joke5/400/250', likes: 1567 },
    { title: '生活哲学', content: '人生就像打电话，不是你先挂就是我先挂，反正最后都要挂。', image: 'https://picsum.photos/seed/joke6/400/250', likes: 3421 }
  ],
  qiushi: [
    { title: '电梯尴尬', content: '进电梯发现老板在里面，我紧张地按了所有楼层，然后假装这是新功能演示。', image: 'https://picsum.photos/seed/qiushi1/400/300', likes: 4521 },
    { title: '认错人', content: '在商场拍了前面人的肩膀说"亲爱的"，结果是个陌生大叔，他说："小伙子，眼光不错。"', image: 'https://picsum.photos/seed/qiushi2/400/300', likes: 3890 },
    { title: '开会社死', content: '视频会议时以为静音了，结果全家都听到我吐槽老板的新发型。', image: 'https://picsum.photos/seed/qiushi3/400/300', likes: 5234 },
    { title: '外卖事故', content: '点外卖备注"多放辣"，结果送来的是一整袋干辣椒，现在我在医院。', image: 'https://picsum.photos/seed/qiushi4/400/300', likes: 2876 },
    { title: '健身尴尬', content: '第一次去健身房，把跑步机速度调到最大，现在我在墙上。', image: 'https://picsum.photos/seed/qiushi5/400/300', likes: 4123 },
    { title: '购物失误', content: '网购时没看尺寸，收到了一个需要放大镜才能看见的"巨型"玩偶。', image: 'https://picsum.photos/seed/qiushi6/400/300', likes: 3567 }
  ]
};

// ============================================
// 抓取函数
// ============================================

/**
 * 使用 Tavily Search API 搜索指定分类的摸鱼内容
 * @param {string} category - 分类 key (funny/beauty/jokes/qiushi)
 * @param {number} limit - 最大结果数
 * @returns {Promise<Array>} 格式化后的内容列表
 */
async function fetchMoyuContent(category, limit = 6) {
  console.log(`\n📡 正在抓取 [${MOYU_SOURCES[category].name}] 内容...`);

  const config = MOYU_SOURCES[category];

  // 检查是否有 Tavily API Key
  if (!process.env.TAVILY_API_KEY) {
    console.log('  ℹ️  未配置 TAVILY_API_KEY，使用模拟数据');
    return MOCK_DATA[category].slice(0, limit);
  }

  try {
    const allResults = [];
    const usedUrls = new Set();

    // 逐个查询搜索，合并去重
    for (const query of config.queries) {
      try {
        const results = await tavily_search(query, limit);

        for (const item of results) {
          if (!usedUrls.has(item.url) && item.url !== '#') {
            usedUrls.add(item.url);
            allResults.push(item);
          }
        }

        // 避免请求过快
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.warn(`  ⚠️ 查询 "${query}" 失败: ${error.message}`);
      }
    }

    if (allResults.length === 0) {
      console.log('  ⚠️ 搜索无结果，使用模拟数据');
      return MOCK_DATA[category].slice(0, limit);
    }

    // 格式化结果
    const formatted = allResults.slice(0, limit).map((item, index) => ({
      title: item.title || config.name + ' #' + (index + 1),
      content: item.summary || item.rawContent || '',
      image: item.image || config.placeholderImages[index] || `https://picsum.photos/seed/${category}${index}/400/300`,
      likes: Math.floor(Math.random() * 4000) + 500,
      source: item.source || '网络',
      url: item.url || '#'
    }));

    console.log(`  ✅ ${config.name}: ${formatted.length} 条`);
    return formatted;
  } catch (error) {
    console.warn(`  ⚠️ 抓取失败: ${error.message}`);
    console.log('  ℹ️  使用模拟数据');
    return MOCK_DATA[category].slice(0, limit);
  }
}

/**
 * 生成所有摸鱼分类的内容
 * @param {boolean} useRealApi - 是否使用真实 API
 * @returns {Promise<Object>} 包含所有分类内容的对象
 */
async function generateAllMoyuContent(useRealApi = true) {
  console.log('\n🎣 摸鱼内容生成器');
  console.log('====================\n');

  // 优先尝试真实 API
  if (useRealApi) {
    try {
      const realData = await fetchAllRealContent();
      if (realData.beauty.length > 0 || realData.jokes.length > 0) {
        // 合并神回复到段子
        const jokes = [...realData.jokes, ...(realData.shenhuifu || [])].slice(0, 12);
        
        return {
          funny: realData.funny.length > 0 ? realData.funny : MOCK_DATA.funny,
          beauty: realData.beauty.length > 0 ? realData.beauty : MOCK_DATA.beauty,
          jokes: jokes.length > 0 ? jokes : MOCK_DATA.jokes,
          qiushi: realData.qiushi.length > 0 ? realData.qiushi : MOCK_DATA.qiushi,
          github: realData.github && realData.github.length > 0 ? realData.github : []
        };
      }
    } catch (error) {
      console.warn('⚠️ 真实 API 获取失败，回退到 Tavily:', error.message);
    }
  }

  // 回退到 Tavily 或 mock
  const data = {};

  for (const [key, config] of Object.entries(MOYU_SOURCES)) {
    data[key] = await fetchMoyuContent(key, 6);
    // 避免请求过快
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n📊 摸鱼内容统计:');
  Object.entries(data).forEach(([key, items]) => {
    console.log(`  ${MOYU_SOURCES[key].icon} ${MOYU_SOURCES[key].name}: ${items.length} 条`);
  });

  return { ...data, github: [] };
}

/**
 * 保存摸鱼数据到 JSON 文件
 * @param {Object} data - 摸鱼内容数据
 * @param {string} outputPath - 输出文件路径
 */
function saveMoyuData(data, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 摸鱼数据已保存: ${outputPath}`);
}

module.exports = {
  MOYU_SOURCES,
  fetchMoyuContent,
  generateAllMoyuContent,
  saveMoyuData,
  MOCK_DATA
};
