# 🎣 摸鱼观察室

> 你假装在工作，我假装很正经

当代人精神马杀鸡网站，提供搞笑图片、美女福利、内涵段子、糗事百科内容，以及每日更新的 **AI日报** 功能。

## 🌟 功能特点

- 📸 **搞笑图片** - 轻松一刻，告别无聊
- 👀 **美女福利** - 工作太累，眼睛要吃糖
- 😏 **内涵段子** - 成年人懂的都懂
- 🤦 **糗事百科** - 神评时刻，笑料不断
- 🤖 **AI日报** - 每日自动抓取 AI、跨境电商、创业、Web3、新能源热点
- 🎣 **摸鱼指南** - 如何在老板眼皮底下优雅摸鱼

## 🤖 AI日报功能

摸鱼也能跟上科技潮流！AI日报功能每日自动抓取并整理五大领域的热点资讯：

- 🤖 **AI人工智能** - 大模型、ChatGPT、Claude、OpenAI、机器人、智能体
- 🌍 **跨境电商** - SHEIN、Temu、TikTok Shop、亚马逊、独立站
- 💡 **产品创业** - 融资、独角兽、SaaS、PMF、增长、投资
- ⛓️ **区块链Web3** - 加密货币、比特币、以太坊、DeFi、NFT
- ⚡ **新能源** - 电动车、储能、电池、碳中和、光伏、氢能

### AI日报技术栈

- **数据抓取**: Tavily Search API
- **翻译优化**: Kimi API (可选)
- **前端**: 静态 HTML/CSS/JS (MetaBlog 风格)
- **部署**: GitHub Pages + GitHub Actions (每日自动更新)

## 🚀 部署到 GitHub Pages

### 步骤1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`moyu-website`（或你喜欢的名称）
4. 选择 Public
5. 点击 "Create repository"

### 步骤2：上传网站文件

```bash
# 克隆仓库
git clone https://github.com/你的用户名/moyu-website.git
cd moyu-website

# 复制所有文件到仓库目录
# ... 复制文件 ...

# 提交并推送
git add .
git commit -m "Initial commit: 摸鱼观察室 + AI日报"
git push origin main
```

### 步骤3：配置 API Keys (可选，用于AI日报自动更新)

1. 进入你的 GitHub 仓库
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. 添加以下 secrets:
   - `TAVILY_API_KEY`: 你的 Tavily API Key ([获取](https://tavily.com))
   - `KIMI_API_KEY`: 你的 Kimi API Key ([获取](https://platform.moonshot.cn))

### 步骤4：启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 "Settings" → "Pages"
3. 在 "Build and deployment" 部分：
   - Source: 选择 "GitHub Actions"
4. 等待自动部署完成

### 步骤5：访问你的网站

等待几分钟后，你的网站就会部署到：
```
https://你的用户名.github.io/moyu-website/
```

AI日报页面地址：
```
https://你的用户名.github.io/moyu-website/ai-news/
```

## 📝 本地开发

### 安装依赖

```bash
npm install
```

### 生成AI日报（使用模拟数据）

```bash
npm run generate
```

### 生成AI日报（使用真实搜索，需要配置API Key）

```bash
# 创建 .env 文件并添加 API Keys
cp .env.example .env
# 编辑 .env 文件，填入你的 API Keys

# 生成日报
npm run generate
```

### 生成并保存存档

```bash
npm run generate:archive
```

## 🎨 技术栈

- **前端**: HTML5, CSS3, JavaScript
- **样式**: 渐变色、动画、响应式设计
- **部署**: GitHub Pages
- **自动化**: GitHub Actions
- **数据抓取**: Tavily Search API
- **AI翻译**: Kimi API

## 📱 响应式设计

网站支持：
- 💻 桌面端
- 📱 移动端
- 📱 平板端

## 🎉 特色功能

- ✨ 平滑滚动导航
- 🎬 卡片悬停效果
- ⬆️ 回到顶部按钮
- 📷 图片懒加载
- 🎨 渐变色设计
- 🎭 控制台彩蛋
- 🤖 每日自动更新的AI日报
- 📋 日报汇总功能
- 🔍 新闻搜索筛选

## 📄 许可证

MIT License - 随便用，别被老板发现就行！

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**祝摸鱼愉快！🎣**

*不要让老板发现这个网站哦~*
