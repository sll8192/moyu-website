# 🎣 摸鱼观察室

> 你假装在工作，我假装很正经

当代人精神马杀鸡网站，提供搞笑图片、美女福利、内涵段子、糗事百科内容。

## 🌟 功能特点

- 📸 搞笑图片 - 轻松一刻，告别无聊
- 👀 美女福利 - 工作太累，眼睛要吃糖
- 😏 内涵段子 - 成年人懂的都懂
- 🤦 糗事百科 - 神评时刻，笑料不断
- 🎣 摸鱼指南 - 如何在老板眼皮底下优雅摸鱼

## 🚀 部署到 GitHub Pages

### 步骤1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 仓库名称：`moyu-website`（或你喜欢的名称）
4. 选择 Public/Private
5. 点击 "Create repository"

### 步骤2：上传网站文件

```bash
# 进入网站目录
cd /root/.openclaw/workspace/moyu-website

# 初始化 git
git init
git add .
git commit -m "Initial commit: 摸鱼观察室网站"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/moyu-website.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤3：启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 "Settings" → "Pages"
3. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 `main` 分支，文件夹选择 `/ (root)`
4. 点击 "Save"

### 步骤4：访问你的网站

等待几分钟后，你的网站就会部署到：
```
https://你的用户名.github.io/moyu-website/
```

## 📝 自定义内容

### 修改图片

在 `index.html` 中找到：
```html
<div class="placeholder-img">📸 搞笑图片1</div>
```

替换为真实图片：
```html
<img src="你的图片URL" alt="搞笑图片">
```

### 修改段子内容

在 `index.html` 的 `.joke-item` 中修改段子内容。

### 修改样式

编辑 `styles.css` 来自定义颜色、布局等。

## 🎨 技术栈

- HTML5 - 页面结构
- CSS3 - 样式设计（渐变色、动画、响应式）
- JavaScript - 交互效果
- GitHub Pages - 免费部署

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

## 📄 许可证

MIT License - 随便用，别被老板发现就行！

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**祝摸鱼愉快！🎣**

*不要让老板发现这个网站哦~*
