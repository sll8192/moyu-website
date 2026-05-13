/**
 * 摸鱼内容生成脚本
 * 由 GitHub Actions 调用
 */

require('dotenv').config();
const { generateAllMoyuContent, saveMoyuData } = require('./moyu-scraper');

async function main() {
  console.log('🎣 开始生成摸鱼内容...\n');
  const data = await generateAllMoyuContent();
  saveMoyuData(data, 'backend/data/moyu-content.json');
  console.log('\n✅ 摸鱼内容生成完成！');
}

main().catch(err => {
  console.error('❌ 生成失败:', err.message);
  process.exit(1);
});
