// 摸鱼观察室 - 网站交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    initSmoothScroll();
    
    // 卡片点击效果
    initCardInteractions();
    
    // 懒加载效果
    initLazyLoad();
    
    // 回到顶部按钮
    initBackToTop();
    
    console.log('🎣 摸鱼观察室已加载完成！');
});

// 平滑滚动
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// 卡片点击效果
function initCardInteractions() {
    const cards = document.querySelectorAll('.card, .joke-item, .tip-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // 添加点击动画
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// 懒加载效果（模拟）
function initLazyLoad() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}

// 回到顶部按钮
function initBackToTop() {
    // 创建按钮
    const btn = document.createElement('button');
    btn.innerHTML = '⬆️';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(btn);
    
    // 滚动显示/隐藏
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        } else {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
        }
    });
    
    // 点击回到顶部
    btn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 添加一些有趣的控制台彩蛋
const easterEggs = [
    '🎣 摸鱼观察室 - 你假装在工作，我假装很正经',
    '😂 工作太累？来摸鱼吧！',
    '👀 不要让老板发现这个网站哦~',
    '🍻 点赞、在看、转发三连！',
    '🎣 摸鱼使人快乐，工作使人秃头'
];

console.log('%c' + easterEggs[Math.floor(Math.random() * easterEggs.length)], 
    'color: #667eea; font-size: 14px; font-weight: bold;');

console.log('%c' + '摸鱼指南：Ctrl+R 刷新更多快乐！', 
    'color: #764ba2; font-size: 12px;');
