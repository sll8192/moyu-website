/**
 * 摸鱼观察室 - 主站脚本
 * 动态加载摸鱼内容和 AI 日报
 */

// 摸鱼内容数据（将由后端生成）
let moyuData = {
  funny: [],
  beauty: [],
  jokes: [],
  qiushi: []
};

// 模拟数据（作为后备）
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
    { title: '程序员的浪漫', content: '我对你的爱就像循环语句，没有break，只有continue，直到内存溢出。', likes: 1234 },
    { title: '成年人的世界', content: '小时候以为"早睡早起身体好"是个建议，长大后才知道这是三个愿望。', likes: 2345 },
    { title: '职场真相', content: '老板：这个项目很简单；实际：需要学会时光倒流。', likes: 1876 },
    { title: '健身感悟', content: '健身三个月，体重没变，但心态变了——从想瘦变成了想吃。', likes: 2987 },
    { title: '相亲经历', content: '对方问：你有房吗？我说：有，斗地主里还有炸弹呢。', likes: 1567 },
    { title: '生活哲学', content: '人生就像打电话，不是你先挂就是我先挂，反正最后都要挂。', likes: 3421 }
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

/**
 * 初始化页面
 */
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initBackToTop();
  loadMoyuContent();
  initSmoothScroll();
});

/**
 * 导航栏功能
 */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 滚动时更新导航栏样式
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
  });
  
  // 移动端菜单切换
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      // 这里可以添加移动端菜单展开逻辑
      console.log('Mobile menu clicked');
    });
  }
  
  // 导航链接点击更新 active 状态
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/**
 * 回到顶部按钮
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 平滑滚动
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 加载摸鱼内容
 */
async function loadMoyuContent() {
  try {
    // 尝试从后端加载数据
    const response = await fetch('backend/data/moyu-content.json');
    if (response.ok) {
      moyuData = await response.json();
    } else {
      // 使用模拟数据
      moyuData = MOCK_DATA;
    }
  } catch (error) {
    console.log('使用模拟数据:', error);
    moyuData = MOCK_DATA;
  }
  
  // 渲染内容
  renderFunnyContent();
  renderBeautyContent();
  renderJokesContent();
  renderQiushiContent();
}

/**
 * 渲染搞笑图片
 */
function renderFunnyContent() {
  const container = document.getElementById('funny-grid');
  if (!container) return;
  
  const items = moyuData.funny || MOCK_DATA.funny;
  container.innerHTML = items.map(item => `
    <div class="content-card">
      <div class="card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="card-overlay"></div>
        <div class="card-likes">
          <span>❤️</span>
          <span>${formatNumber(item.likes)}</span>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.content}</p>
      </div>
    </div>
  `).join('');
}

/**
 * 渲染美女福利
 */
function renderBeautyContent() {
  const container = document.getElementById('beauty-grid');
  if (!container) return;
  
  const items = moyuData.beauty || MOCK_DATA.beauty;
  container.innerHTML = items.map(item => `
    <div class="content-card">
      <div class="card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="card-overlay"></div>
        <div class="card-likes">
          <span>❤️</span>
          <span>${formatNumber(item.likes)}</span>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.content}</p>
      </div>
    </div>
  `).join('');
}

/**
 * 渲染内涵段子
 */
function renderJokesContent() {
  const container = document.getElementById('jokes-list');
  if (!container) return;
  
  const items = moyuData.jokes || MOCK_DATA.jokes;
  container.innerHTML = items.map(item => `
    <div class="joke-card">
      <div class="joke-header">
        <h3 class="joke-title">${item.title}</h3>
        <div class="joke-likes">
          <span>❤️</span>
          <span>${formatNumber(item.likes)}</span>
        </div>
      </div>
      <p class="joke-content">${item.content}</p>
    </div>
  `).join('');
}

/**
 * 渲染糗事百科
 */
function renderQiushiContent() {
  const container = document.getElementById('qiushi-grid');
  if (!container) return;
  
  const items = moyuData.qiushi || MOCK_DATA.qiushi;
  container.innerHTML = items.map(item => `
    <div class="content-card">
      <div class="card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="card-overlay"></div>
        <div class="card-likes">
          <span>❤️</span>
          <span>${formatNumber(item.likes)}</span>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.content}</p>
      </div>
    </div>
  `).join('');
}

/**
 * 格式化数字（添加千位分隔符）
 */
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * 控制台彩蛋
 */
console.log('%c🎣 摸鱼观察室', 'font-size: 24px; font-weight: bold; color: #2563EB;');
console.log('%c你假装在工作，我假装很正经', 'font-size: 14px; color: #64748B;');
console.log('%c不要让老板发现这个网站哦~', 'font-size: 12px; color: #F97316; font-style: italic;');
