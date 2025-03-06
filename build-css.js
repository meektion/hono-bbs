import * as sass from 'sass';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 编译 SCSS 文件
function compileSass() {
  const inputFile = path.resolve(__dirname, 'src/styles/main.scss');
  const outputDir = path.resolve(__dirname, 'public/static');
  const outputFile = path.join(outputDir, 'main.css');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // 编译 SCSS
    const result = sass.compile(inputFile, {
      style: 'compressed',
      loadPaths: [path.resolve(__dirname, 'node_modules')],
      quietDeps: true
    });
    
    // 写入文件
    fs.writeFileSync(outputFile, result.css);
    console.log('SCSS 编译完成，CSS 文件已生成在 public/static/main.css');
    
    // 复制到 dist 目录
    const distDir = path.resolve(__dirname, 'dist/static');
    const distFile = path.join(distDir, 'main.css');
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.copyFileSync(outputFile, distFile);
    console.log(`CSS 文件已复制到 ${distFile}`);
    
    return true;
  } catch (error) {
    console.error('SCSS 编译错误:', error);
    return false;
  }
}

// 执行编译
compileSass();
