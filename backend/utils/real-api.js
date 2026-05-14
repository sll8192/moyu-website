/**
 * 真实 API 工具
 * 封装第三方 API 调用：美女图片、段子、神回复
 */

const https = require('https');
const http = require('http');

// ============================================
// 美女图片 API (picasso.adesk.com)
// ============================================

/**
 * 获取美女/动漫壁纸
 * @param {string} categoryId - 分类ID (动漫: 4e4d610cdf714d2966000003, 美女: 4e4d610cdf714d2966000000)
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>} 图片列表
 */
async function fetchBeautyImages(categoryId = '4e4d610cdf714d2966000003', limit = 30) {
  const url = `https://service.picasso.adesk.com/v1/wallpaper/category/${categoryId}/wallpaper?limit=${limit}&adult=false&first=1&order=hot`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 0 && json.res?.wallpaper?.length > 0) {
            const images = json.res.wallpaper.map(item => ({
              image: item.img || item.preview,
              thumb: item.thumb,
              title: item.tag?.join(' ') || '精美壁纸',
              likes: item.favs || Math.floor(Math.random() * 5000) + 1000,
              id: item.id
            }));
            resolve(images);
          } else {
            console.warn('⚠️ 美女 API 返回空数据');
            resolve([]);
          }
        } catch (e) {
          console.warn('⚠️ 美女 API 解析失败:', e.message);
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.warn('⚠️ 美女 API 请求失败:', e.message);
      resolve([]);
    });
  });
}

// ============================================
// 段子 API (mxnzp.com)
// ============================================

/**
 * 获取随机段子列表
 * @returns {Promise<Array>} 段子列表
 */
async function fetchJokes() {
  const url = 'https://www.mxnzp.com/api/jokes/list/random?app_id=x2nphgpoldnhnpnr&app_secret=mqQFt3vq1HgaKf6Xcfs05JfK82VRwZJQ';
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 1 && json.data?.length > 0) {
            const jokes = json.data.map((item, index) => ({
              title: `段子 #${index + 1}`,
              content: item.content,
              time: item.updateTime,
              likes: Math.floor(Math.random() * 3000) + 500,
              source: '段子库'
            }));
            resolve(jokes);
          } else {
            console.warn('⚠️ 段子 API 返回空数据');
            resolve([]);
          }
        } catch (e) {
          console.warn('⚠️ 段子 API 解析失败:', e.message);
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.warn('⚠️ 段子 API 请求失败:', e.message);
      resolve([]);
    });
  });
}

// ============================================
// 神回复 API (yduanzi.com)
// ============================================

/**
 * 获取单条神回复
 * @returns {Promise<Object|null>} 神回复对象
 */
async function fetchOneShenhuifu() {
  const url = 'https://www.yduanzi.com/duanzi/getduanzi';
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success && json.duanzi) {
            resolve({
              content: json.duanzi,
              qiafan: json.qiafan
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * 批量获取神回复（多次请求）
 * @param {number} count - 需要的数量
 * @returns {Promise<Array>} 神回复列表
 */
async function fetchShenhuifu(count = 10) {
  const results = [];
  const maxAttempts = count * 3; // 最多尝试 count*3 次
  let attempts = 0;
  
  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    try {
      const item = await fetchOneShenhuifu();
      if (item && item.content) {
        results.push({
          title: `神回复 #${results.length + 1}`,
          content: item.content,
          likes: Math.floor(Math.random() * 4000) + 1000,
          source: '神回复'
        });
      }
      // 短暂延迟避免请求过快
      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      // 继续尝试
    }
  }
  
  console.log(`  📝 神回复: 获取 ${results.length}/${count} 条 (尝试 ${attempts} 次)`);
  return results;
}

// ============================================
// 综合获取函数
// ============================================

/**
 * 获取所有摸鱼内容（真实 API）
 * @returns {Promise<Object>} 包含所有分类内容的对象
 */
async function fetchAllRealContent() {
  console.log('\n🌐 使用真实 API 获取摸鱼内容...\n');
  
  const data = {
    beauty: [],
    funny: [],
    jokes: [],
    qiushi: [],
    shenhuifu: [],
    github: []
  };
  
  // 1. 美女图片 (动漫分类)
  console.log('📡 正在获取动漫/美女图片...');
  const beautyImages = await fetchBeautyImages('4e4d610cdf714d2966000003', 30);
  data.beauty = beautyImages.slice(0, 12);
  console.log(`  ✅ 美女图片: ${data.beauty.length} 条`);
  
  // 2. 搞笑图片 (使用动漫图片作为替代)
  console.log('📡 正在获取搞笑图片...');
  const funnyImages = await fetchBeautyImages('4e4d610cdf714d2966000001', 20); // 动物分类
  data.funny = funnyImages.slice(0, 8).map(img => ({
    ...img,
    title: img.title || '搞笑图片'
  }));
  console.log(`  ✅ 搞笑图片: ${data.funny.length} 条`);
  
  // 3. 段子
  console.log('📡 正在获取段子...');
  const jokes = await fetchJokes();
  data.jokes = jokes.slice(0, 8);
  console.log(`  ✅ 段子: ${data.jokes.length} 条`);
  
  // 4. 神回复
  console.log('📡 正在获取神回复...');
  data.shenhuifu = await fetchShenhuifu(8);
  
  // 5. 糗事 (使用段子的变体)
  data.qiushi = jokes.slice(0, 6).map((j, i) => ({
    title: `糗事 #${i + 1}`,
    content: j.content,
    image: `https://picsum.photos/seed/qiushi${i}/400/300`,
    likes: Math.floor(Math.random() * 3000) + 500,
    source: '糗事百科'
  }));
  console.log(`  ✅ 糗事: ${data.qiushi.length} 条`);
  
  // 6. GitHub 热榜
  console.log('📡 正在获取 GitHub 热榜...');
  data.github = await fetchGithubTrending();
  console.log(`  ✅ GitHub 热榜: ${data.github.length} 条`);
  
  console.log('\n📊 真实内容统计:');
  console.log(`  👀 美女福利: ${data.beauty.length} 条`);
  console.log(`  😂 搞笑图片: ${data.funny.length} 条`);
  console.log(`  🤣 段子: ${data.jokes.length} 条`);
  console.log(`  💬 神回复: ${data.shenhuifu.length} 条`);
  console.log(`  😅 糗事: ${data.qiushi.length} 条`);
  console.log(`  🔥 GitHub 热榜: ${data.github.length} 条`);
  
  return data;
}

// ============================================
// GitHub Trending API
// ============================================

/**
 * 延迟指定毫秒数
 * @param {number} ms - 毫秒数
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化 star 数量（如 1200 -> "1.2k"）
 * @param {number} count - star 数量
 * @returns {string} 格式化后的字符串
 */
function formatStars(count) {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(count);
}

/**
 * 通过 GitHub Search API 获取指定语言的近期热门仓库
 * @param {string} language - 编程语言
 * @param {number} perPage - 每页数量
 * @returns {Promise<Array>} 仓库列表
 */
async function fetchTrendingByLanguage(language, perPage = 5) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split('T')[0]; // e.g. "2026-05-06"

  const query = encodeURIComponent(`created:>${dateStr}+stars:>50+language:${language}`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${perPage}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'moyu-website'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items.length > 0) {
            const repos = json.items.map(repo => ({
              name: repo.full_name,
              description: repo.description || '',
              url: repo.html_url,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              language: repo.language || 'Unknown',
              topics: repo.topics || [],
              createdAt: repo.created_at,
              updatedAt: repo.updated_at
            }));
            resolve(repos);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.warn(`⚠️ GitHub API 解析失败 (${language}):`, e.message);
          resolve([]);
        }
      });
    });

    req.on('error', (e) => {
      console.warn(`⚠️ GitHub API 请求失败 (${language}):`, e.message);
      resolve([]);
    });
  });
}

/**
 * 获取多个编程语言的 GitHub 热门项目
 * @param {Array<string>} languages - 编程语言列表
 * @returns {Promise<Array>} 去重后的热门项目列表
 */
async function fetchGithubTrending(languages = ['javascript', 'python', 'typescript', 'rust', 'go']) {
  const allRepos = [];
  const seenNames = new Set();

  for (const lang of languages) {
    try {
      const repos = await fetchTrendingByLanguage(lang, 5);
      for (const repo of repos) {
        if (!seenNames.has(repo.name)) {
          seenNames.add(repo.name);
          allRepos.push(repo);
        }
      }
    } catch (e) {
      console.warn(`⚠️ 获取 ${lang} 热门项目失败:`, e.message);
    }
    // GitHub API rate limit: 每次请求后延迟 1 秒
    await delay(1000);
  }

  // 按 stars 降序排序，取前 20 个
  allRepos.sort((a, b) => b.stars - a.stars);
  return allRepos.slice(0, 20);
}

/**
 * 格式化 GitHub Trending 数据，适合 generate.js 使用
 * @param {Array} repos - 仓库列表
 * @returns {Array} 格式化后的列表
 */
function formatGithubTrending(repos) {
  return repos.map(repo => ({
    title: repo.name,
    description: repo.description,
    url: repo.url,
    stars: formatStars(repo.stars),
    language: repo.language,
    topics: repo.topics.slice(0, 3)
  }));
}

module.exports = {
  fetchBeautyImages,
  fetchJokes,
  fetchShenhuifu,
  fetchAllRealContent,
  fetchGithubTrending,
  formatGithubTrending
};
