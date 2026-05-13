/**
 * 摸鱼观察室 - 完整页面生成器
 *
 * 合并 AI 日报 + 摸鱼内容，生成一个完整的、可直接部署的 index.html
 * 所有样式内联，无需外部 CSS/JS 文件
 * 
 * 设计风格: tose.sh - 深色主题 + 绿色强调
 */

const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

const { generateDailyNews, getMockNews, saveData } = require('./scraper');
const { generateAllMoyuContent, MOCK_DATA } = require('./moyu-scraper');

// 路径配置
const PATHS = {
  data: path.join(__dirname, '../data/daily.json'),
  output: path.join(__dirname, '../../index.html')
};

// ============================================
// 内联 CSS 样式 - tose.sh 风格
// ============================================
const INLINE_CSS = `
/* ===== tose.sh Design System ===== */
/* Primary: #1E293B | Secondary: #334155 | CTA: #22C55E | Background: #0F172A | Text: #F8FAFC */

/* ===== Reset & Base ===== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0F172A;
  color: #F8FAFC;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
img { max-width: 100%; height: auto; display: block; }
ul { list-style: none; }

/* ===== Navbar ===== */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  padding: 0 24px; height: 72px;
  display: flex; align-items: center; justify-content: space-between;
}
.navbar-logo {
  display: flex; align-items: center; gap: 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px; font-weight: 700; color: #F8FAFC;
}
.navbar-logo span { font-size: 28px; }
.navbar-links { display: flex; gap: 8px; }
.navbar-links a {
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
  color: #94A3B8; transition: all 0.2s;
}
.navbar-links a:hover, .navbar-links a.active {
  background: rgba(34, 197, 94, 0.15); color: #22C55E;
}
.navbar-time { 
  font-size: 13px; color: #64748B;
  font-family: 'Space Grotesk', monospace;
}

/* ===== Hero ===== */
.hero {
  margin-top: 72px;
  background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%);
  padding: 80px 24px 64px; text-align: center; 
  position: relative;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 50%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }
.hero h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 48px; font-weight: 700; margin-bottom: 16px; 
  letter-spacing: -1px;
  background: linear-gradient(135deg, #F8FAFC 0%, #22C55E 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p { 
  font-size: 18px; color: #94A3B8; 
  max-width: 600px; margin: 0 auto 32px;
}
.hero-stats {
  display: flex; justify-content: center; gap: 48px;
}
.hero-stat { 
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 16px;
  padding: 24px 32px;
  backdrop-filter: blur(10px);
}
.hero-stat .num { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36px; font-weight: 700; 
  color: #22C55E;
}
.hero-stat .label { 
  font-size: 14px; color: #94A3B8; 
  margin-top: 4px; text-transform: uppercase;
  letter-spacing: 1px;
}

/* ===== Container ===== */
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* ===== Section ===== */
.section { padding: 56px 0; }
.section-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 32px;
}
.section-icon { font-size: 32px; }
.section-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px; font-weight: 700; color: #F8FAFC; 
}
.section-badge {
  background: rgba(34, 197, 94, 0.15); 
  color: #22C55E; 
  font-family: 'Space Grotesk', monospace;
  font-size: 13px; font-weight: 600;
  padding: 6px 14px; border-radius: 20px; 
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.section-divider { 
  height: 1px; 
  background: linear-gradient(90deg, transparent, rgba(51, 65, 85, 0.5), transparent); 
  margin: 0 0 56px; 
}

/* ===== Card Grid ===== */
.card-grid {
  display: grid; gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
}

/* ===== News Card (AI日报) ===== */
.news-card {
  background: #1E293B; border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: transform 0.3s, border-color 0.3s;
  display: flex; flex-direction: column;
}
.news-card:hover { 
  transform: translateY(-6px); 
  border-color: rgba(34, 197, 94, 0.5);
}
.news-card-img {
  width: 100%; height: 200px; object-fit: cover;
  background: #334155;
}
.news-card-body { 
  padding: 20px 24px 24px; 
  flex: 1; display: flex; flex-direction: column; 
}
.news-card-tag {
  display: inline-block; font-size: 11px; font-weight: 600;
  padding: 4px 12px; border-radius: 6px; margin-bottom: 12px; 
  width: fit-content;
  font-family: 'Space Grotesk', monospace;
}
.tag-ai { background: rgba(34, 197, 94, 0.2); color: #22C55E; }
.tag-ecommerce { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
.tag-startup { background: rgba(251, 191, 36, 0.2); color: #FBBF24; }
.tag-web3 { background: rgba(168, 85, 247, 0.2); color: #A855F7; }
.tag-newenergy { background: rgba(236, 72, 153, 0.2); color: #EC4899; }
.news-card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; font-weight: 600; line-height: 1.4; 
  margin-bottom: 10px; color: #F8FAFC;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.news-card-summary {
  font-size: 14px; color: #94A3B8; line-height: 1.7; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.news-card-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding-top: 14px; 
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  font-size: 12px; color: #64748B;
}
.news-card-source { 
  display: flex; align-items: center; gap: 6px;
  font-family: 'Space Grotesk', monospace;
}

/* ===== Image Card (搞笑图片 / 美女福利) ===== */
.image-card {
  background: #1E293B; border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: transform 0.3s, border-color 0.3s;
}
.image-card:hover { 
  transform: translateY(-6px); 
  border-color: rgba(34, 197, 94, 0.5);
}
.image-card img {
  width: 100%; height: 280px; object-fit: cover; 
  background: #334155;
}
.image-card-body { padding: 18px 20px 20px; }
.image-card-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; 
  margin-bottom: 8px; color: #F8FAFC; 
}
.image-card-actions {
  display: flex; align-items: center; justify-content: space-between; 
  margin-top: 12px;
  font-size: 13px; color: #64748B;
}
.like-btn {
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  background: none; border: none; color: #64748B; 
  font-family: 'Space Grotesk', monospace;
  font-size: 13px; padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.like-btn:hover { 
  color: #22C55E; 
  background: rgba(34, 197, 94, 0.1);
}

/* ===== Joke Card (内涵段子) ===== */
.joke-card {
  background: #1E293B; border-radius: 16px; padding: 24px 28px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: transform 0.3s, border-color 0.3s;
}
.joke-card:hover { 
  transform: translateX(6px); 
  border-color: rgba(34, 197, 94, 0.5);
}
.joke-card-header {
  display: flex; align-items: center; justify-content: space-between; 
  margin-bottom: 16px;
}
.joke-card-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; font-weight: 600; color: #F8FAFC; 
}
.joke-card-content {
  font-size: 15px; color: #CBD5E1; line-height: 1.8;
  padding: 18px 20px; 
  background: rgba(30, 41, 59, 0.5); 
  border-radius: 12px;
  border-left: 4px solid #22C55E;
}
.joke-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; font-size: 13px; color: #64748B;
}

/* ===== Qiushi Card (糗事百科) ===== */
.qiushi-card {
  background: #1E293B; border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: transform 0.3s, border-color 0.3s;
  display: flex; flex-direction: column;
}
.qiushi-card:hover { 
  transform: translateY(-6px); 
  border-color: rgba(34, 197, 94, 0.5);
}
.qiushi-card img {
  width: 100%; height: 200px; object-fit: cover; 
  background: #334155;
}
.qiushi-card-body { 
  padding: 20px 24px 24px; 
  flex: 1; display: flex; flex-direction: column; 
}
.qiushi-card-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 17px; font-weight: 600; 
  margin-bottom: 10px; color: #F8FAFC; 
}
.qiushi-card-content {
  font-size: 14px; color: #94A3B8; line-height: 1.7; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.qiushi-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding-top: 14px; 
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  font-size: 13px; color: #64748B;
}

/* ===== Guide Section ===== */
.guide-grid {
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 24px;
}
.guide-card {
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  border-radius: 16px; padding: 28px; 
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: transform 0.3s, border-color 0.3s;
  position: relative;
  overflow: hidden;
}
.guide-card::before {
  content: '';
  position: absolute;
  top: 0; right: 0; width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
  pointer-events: none;
}
.guide-card:hover { 
  transform: translateY(-6px); 
  border-color: rgba(34, 197, 94, 0.5);
}
.guide-card-number {
  position: absolute; top: 16px; right: 20px;
  font-family: 'Space Grotesk', monospace;
  font-size: 48px; font-weight: 700;
  color: rgba(34, 197, 94, 0.15);
}
.guide-card-icon { font-size: 40px; margin-bottom: 16px; }
.guide-card-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; font-weight: 600; 
  color: #F8FAFC; margin-bottom: 10px; 
}
.guide-card-desc { 
  font-size: 14px; color: #94A3B8; line-height: 1.7; 
}

/* ===== Footer ===== */
.footer {
  background: linear-gradient(180deg, #0F172A 0%, #020617 100%); 
  color: #94A3B8; 
  padding: 64px 24px 32px; 
  margin-top: 64px;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
}
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px;
}
.footer-brand-name { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px; font-weight: 700; 
  color: #F8FAFC; margin-bottom: 12px; 
}
.footer-brand-desc { 
  font-size: 14px; line-height: 1.8; color: #64748B; 
}
.footer-col-title { 
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px; font-weight: 600; 
  color: #F8FAFC; margin-bottom: 16px; 
}
.footer-col a {
  display: block; font-size: 14px; 
  color: #64748B; padding: 6px 0; 
  transition: color 0.2s;
}
.footer-col a:hover { color: #22C55E; }
.footer-bottom {
  max-width: 1200px; margin: 40px auto 0; 
  padding-top: 24px;
  border-top: 1px solid rgba(51, 65, 85, 0.3); 
  text-align: center; font-size: 13px; color: #475569;
}
.footer-link {
  color: #22C55E; transition: opacity 0.2s;
}
.footer-link:hover { opacity: 0.8; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .navbar { padding: 0 16px; height: 64px; }
  .navbar-links { display: none; }
  .navbar-time { display: none; }
  .hero { margin-top: 64px; padding: 48px 16px 40px; }
  .hero h1 { font-size: 32px; }
  .hero p { font-size: 16px; }
  .hero-stats { gap: 16px; flex-wrap: wrap; }
  .hero-stat { padding: 16px 24px; }
  .hero-stat .num { font-size: 28px; }
  .container { padding: 0 16px; }
  .section { padding: 40px 0; }
  .section-title { font-size: 22px; }
  .card-grid { grid-template-columns: 1fr; gap: 20px; }
  .guide-grid { grid-template-columns: 1fr; gap: 20px; }
  .footer-inner { grid-template-columns: 1fr; gap: 32px; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
  .guide-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

// ============================================
// HTML 生成辅助函数
// ============================================

/**
 * 生成 AI 日报新闻卡片 HTML
 */
function renderNewsSection(categories) {
  if (!categories || categories.length === 0) return '';

  const tagClassMap = {
    ai: 'tag-ai',
    ecommerce: 'tag-ecommerce',
    startup: 'tag-startup',
    web3: 'tag-web3',
    newenergy: 'tag-newenergy'
  };

  let html = '';

  for (const cat of categories) {
    if (!cat.items || cat.items.length === 0) continue;

    html += `
    <div class="section" id="section-${cat.id}">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">${cat.icon}</span>
          <h2 class="section-title">${cat.name}</h2>
          <span class="section-badge">${cat.items.length} 条</span>
        </div>
        <div class="card-grid">
    `;

    for (const item of cat.items) {
      const tagClass = tagClassMap[cat.id] || 'tag-ai';
      const tag = item.tag || '资讯';
      const imgSrc = item.image || 'https://picsum.photos/seed/news/400/250';
      const title = escapeHtml(item.title);
      const summary = escapeHtml(item.summary);
      const source = escapeHtml(item.source || '网络');
      const time = escapeHtml(item.time || '今日');
      const link = item.url || '#';

      html += `
          <a href="${link}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">
            <div class="news-card">
              <img class="news-card-img" src="${imgSrc}" alt="${title}" loading="lazy">
              <div class="news-card-body">
                <span class="news-card-tag ${tagClass}">${escapeHtml(tag)}</span>
                <h3 class="news-card-title">${title}</h3>
                <p class="news-card-summary">${summary}</p>
                <div class="news-card-meta">
                  <span class="news-card-source">📰 ${source}</span>
                  <span>${time}</span>
                </div>
              </div>
            </div>
          </a>
      `;
    }

    html += `
        </div>
      </div>
    </div>
    <div class="container"><div class="section-divider"></div></div>
    `;
  }

  return html;
}

/**
 * 生成搞笑图片区块 HTML
 */
function renderFunnySection(items) {
  if (!items || items.length === 0) return '';

  let html = `
    <div class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">😂</span>
          <h2 class="section-title">搞笑图片</h2>
          <span class="section-badge">${items.length} 条</span>
        </div>
        <div class="card-grid">
  `;

  for (const item of items) {
    const imgSrc = item.image || 'https://picsum.photos/seed/funny/400/300';
    const title = escapeHtml(item.title);
    const likes = item.likes || 0;

    html += `
          <div class="image-card">
            <img src="${imgSrc}" alt="${title}" loading="lazy">
            <div class="image-card-body">
              <div class="image-card-title">${title}</div>
              <div class="image-card-actions">
                <button class="like-btn" onclick="this.style.color='#22C55E';this.style.background='rgba(34,197,94,0.15)'">❤️ ${likes}</button>
                <span>分享</span>
              </div>
            </div>
          </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
    <div class="container"><div class="section-divider"></div></div>
  `;
  return html;
}

/**
 * 生成美女福利区块 HTML
 */
function renderBeautySection(items) {
  if (!items || items.length === 0) return '';

  let html = `
    <div class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">👀</span>
          <h2 class="section-title">美女福利</h2>
          <span class="section-badge">${items.length} 条</span>
        </div>
        <div class="card-grid">
  `;

  for (const item of items) {
    const imgSrc = item.image || 'https://picsum.photos/seed/beauty/400/500';
    const title = escapeHtml(item.title);
    const likes = item.likes || 0;

    html += `
          <div class="image-card">
            <img src="${imgSrc}" alt="${title}" loading="lazy">
            <div class="image-card-body">
              <div class="image-card-title">${title}</div>
              <div class="image-card-actions">
                <button class="like-btn" onclick="this.style.color='#22C55E';this.style.background='rgba(34,197,94,0.15)'">❤️ ${likes}</button>
                <span>收藏</span>
              </div>
            </div>
          </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
    <div class="container"><div class="section-divider"></div></div>
  `;
  return html;
}

/**
 * 生成内涵段子区块 HTML
 */
function renderJokesSection(items) {
  if (!items || items.length === 0) return '';

  let html = `
    <div class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">🤣</span>
          <h2 class="section-title">内涵段子</h2>
          <span class="section-badge">${items.length} 条</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;">
  `;

  for (const item of items) {
    const title = escapeHtml(item.title);
    const content = escapeHtml(item.content);
    const likes = item.likes || 0;

    html += `
          <div class="joke-card">
            <div class="joke-card-header">
              <span class="joke-card-title">${title}</span>
              <button class="like-btn" onclick="this.style.color='#22C55E';this.style.background='rgba(34,197,94,0.15)'">❤️ ${likes}</button>
            </div>
            <div class="joke-card-content">${content}</div>
            <div class="joke-card-footer">
              <span>${item.source ? '来源: ' + escapeHtml(item.source) : '网络精选'}</span>
              <span>分享</span>
            </div>
          </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
    <div class="container"><div class="section-divider"></div></div>
  `;
  return html;
}

/**
 * 生成糗事百科区块 HTML
 */
function renderQiushiSection(items) {
  if (!items || items.length === 0) return '';

  let html = `
    <div class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">😅</span>
          <h2 class="section-title">糗事百科</h2>
          <span class="section-badge">${items.length} 条</span>
        </div>
        <div class="card-grid">
  `;

  for (const item of items) {
    const imgSrc = item.image || 'https://picsum.photos/seed/qiushi/400/300';
    const title = escapeHtml(item.title);
    const content = escapeHtml(item.content);
    const likes = item.likes || 0;

    html += `
          <div class="qiushi-card">
            <img src="${imgSrc}" alt="${title}" loading="lazy">
            <div class="qiushi-card-body">
              <div class="qiushi-card-title">${title}</div>
              <div class="qiushi-card-content">${content}</div>
              <div class="qiushi-card-footer">
                <button class="like-btn" onclick="this.style.color='#22C55E';this.style.background='rgba(34,197,94,0.15)'">😂 ${likes}</button>
                <span>${item.source ? escapeHtml(item.source) : '匿名'}</span>
              </div>
            </div>
          </div>
    `;
  }

  html += `
        </div>
      </div>
    </div>
    <div class="container"><div class="section-divider"></div></div>
  `;
  return html;
}

/**
 * 生成摸鱼指南区块 HTML - 带数字编号步骤卡片
 */
function renderGuideSection() {
  const guides = [
    { icon: '⌨️', title: 'Alt+Tab 快速切换', desc: '老板走过来时，一键切回工作界面。建议提前打开一个 Excel 表格备用。' },
    { icon: '📱', title: '手机支架大法', desc: '把手机放在显示器后方，利用余光看视频。注意调节亮度，避免反光。' },
    { icon: '☕', title: '带薪拉屎计时', desc: '每天 3 次，每次 15 分钟，一年多出 16 天假期。记得带手机。' },
    { icon: '🎧', title: '耳机伪装术', desc: '戴着耳机假装听会议录音，实际上在听播客。记得偶尔点头微笑。' },
    { icon: '📝', title: '会议摸鱼学', desc: '开会时带笔记本，认真做笔记的样子。实际上在画火柴人或写小说。' },
    { icon: '🪟', title: '窗口管理大师', desc: 'Ctrl+W 一键关闭当前页面，Win+D 一键回到桌面。肌肉记忆很重要。' }
  ];

  let html = `
    <div class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-icon">🐟</span>
          <h2 class="section-title">摸鱼指南</h2>
          <span class="section-badge">6 招</span>
        </div>
        <div class="guide-grid">
  `;

  guides.forEach((guide, index) => {
    html += `
          <div class="guide-card">
            <span class="guide-card-number">${String(index + 1).padStart(2, '0')}</span>
            <div class="guide-card-icon">${guide.icon}</div>
            <div class="guide-card-title">${guide.title}</div>
            <div class="guide-card-desc">${guide.desc}</div>
          </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;
  return html;
}

// ============================================
// HTML 转义
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================
// 生成完整 HTML
// ============================================
function generateFullHTML(newsData, moyuData) {
  const dateDisplay = newsData.date ? newsData.date.display : new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const totalNews = newsData.categories ? newsData.categories.reduce((s, c) => s + c.items.length, 0) : 0;
  const totalMoyu = moyuData ? Object.values(moyuData).reduce((s, arr) => s + arr.length, 0) : 0;
  const updateTime = new Date().toLocaleString('zh-CN');

  // 导航链接
  const navLinks = [];
  if (newsData.categories) {
    const shortNames = { ai: 'AI', ecommerce: '电商', startup: '创业', web3: 'Web3', newenergy: '能源' };
    for (const cat of newsData.categories) {
      navLinks.push(`<a href="#section-${cat.id}">${shortNames[cat.id] || cat.name}</a>`);
    }
  }
  navLinks.push(`<a href="#section-moyu">摸鱼</a>`);

  // 页脚分类
  const footerCats = [];
  if (newsData.categories) {
    for (const cat of newsData.categories) {
      footerCats.push(`<a href="#section-${cat.id}">${cat.icon} ${cat.name}</a>`);
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="摸鱼观察室 - AI日报 + 搞笑图片 + 美女福利 + 内涵段子 + 糗事百科，每天自动更新">
  <meta name="theme-color" content="#0F172A">
  <title>摸鱼观察室 - ${dateDisplay}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐟</text></svg>">
  <style>${INLINE_CSS}</style>
</head>
<body>

  <!-- ===== Navbar ===== -->
  <nav class="navbar">
    <div class="navbar-logo"><span>🐟</span> 摸鱼观察室</div>
    <div class="navbar-links">
      ${navLinks.join('\n      ')}
    </div>
    <div class="navbar-time">${updateTime}</div>
  </nav>

  <!-- ===== Hero ===== -->
  <section class="hero">
    <div class="hero-content">
      <h1>摸鱼观察室</h1>
      <p>AI 行业日报 + 搞笑图片 + 美女福利 + 内涵段子 + 糗事百科，每天自动更新，打工人的精神食粮</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="num">${totalNews}</div>
          <div class="label">AI 资讯</div>
        </div>
        <div class="hero-stat">
          <div class="num">${totalMoyu}</div>
          <div class="label">摸鱼内容</div>
        </div>
        <div class="hero-stat">
          <div class="num">9</div>
          <div class="label">板块</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== AI 日报 ===== -->
  ${renderNewsSection(newsData.categories)}

  <!-- ===== 搞笑图片 ===== -->
  <div id="section-moyu"></div>
  ${renderFunnySection(moyuData.funny)}

  <!-- ===== 美女福利 ===== -->
  ${renderBeautySection(moyuData.beauty)}

  <!-- ===== 内涵段子 ===== -->
  ${renderJokesSection(moyuData.jokes)}

  <!-- ===== 糗事百科 ===== -->
  ${renderQiushiSection(moyuData.qiushi)}

  <!-- ===== 摸鱼指南 ===== -->
  ${renderGuideSection()}

  <!-- ===== Footer ===== -->
  <footer class="footer">
    <div class="footer-inner">
      <div>
        <div class="footer-brand-name">🐟 摸鱼观察室</div>
        <p class="footer-brand-desc">
          摸鱼观察室是一个自动化内容聚合平台，每日抓取 AI 行业资讯和摸鱼娱乐内容。
          工作再忙，也要记得摸鱼。
        </p>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">内容板块</div>
        ${footerCats.map(c => '        ' + c).join('\n')}
        <a href="#section-moyu">😂 摸鱼专区</a>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">关于</div>
        <a href="#">关于我们</a>
        <a href="#">联系方式</a>
        <a href="#">使用条款</a>
        <a href="#">隐私政策</a>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; 2026 <span class="footer-link">摸鱼观察室</span>. All Rights Reserved. &middot; 更新时间: ${updateTime}
    </div>
  </footer>

</body>
</html>`;
}

// ============================================
// 主函数
// ============================================
async function main() {
  console.log('🐟 摸鱼观察室 - 页面生成器 v2.0 (tose.sh 风格)\n');

  const useReal = process.argv.includes('--real') || process.argv.includes('-r');

  if (useReal) {
    console.log('📡 使用真实 API 获取数据\n');
  } else {
    console.log('📡 使用 mock 数据（添加 --real 参数启用真实 API）\n');
  }

  try {
    let newsData;
    let moyuData;

    if (useReal) {
      // 1. 获取 AI 日报数据（真实 API）
      console.log('📡 正在获取 AI 日报数据...\n');
      newsData = await generateDailyNews(true);

      // 保存 JSON 数据
      saveData(newsData, PATHS.data);

      // 2. 获取摸鱼内容（真实 API）
      console.log('\n📡 正在获取摸鱼内容...\n');
      moyuData = await generateAllMoyuContent();
    } else {
      // 使用内置的丰富 mock 数据
      const SOURCES = require('./scraper').SOURCES || {};
      const mockCategories = [];
      for (const [key, config] of Object.entries(SOURCES)) {
        const items = getMockNews(key);
        if (items.length > 0) {
          mockCategories.push({ id: key, name: config.name, icon: config.icon, items });
        }
      }
      newsData = {
        date: {
          display: new Date().toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
          })
        },
        categories: mockCategories
      };
      moyuData = { ...MOCK_DATA };
      console.log('📦 已加载内置 mock 数据\n');
    }

    // 3. 合并生成完整 HTML
    console.log('🔨 正在生成完整页面...\n');
    const html = generateFullHTML(newsData, moyuData);

    // 4. 写入 index.html
    const outputDir = path.dirname(PATHS.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(PATHS.output, html, 'utf-8');

    console.log(`✅ 页面已生成: ${PATHS.output}`);
    console.log(`   - AI 日报: ${newsData.categories.reduce((s, c) => s + c.items.length, 0)} 条`);
    console.log(`   - 摸鱼内容: ${Object.values(moyuData).reduce((s, a) => s + a.length, 0)} 条`);
    console.log('\n🎉 完成！');

  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 导出
module.exports = {
  generateFullHTML,
  renderNewsSection,
  renderFunnySection,
  renderBeautySection,
  renderJokesSection,
  renderQiushiSection,
  renderGuideSection
};

// 直接运行
if (require.main === module) {
  main();
}
