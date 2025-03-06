import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import * as sass from 'sass'
import fs from 'fs'
import path from 'path'
import type { ViteDevServer, Plugin } from 'vite'

// 预处理 SCSS 文件
function compileSass() {
  const inputFile = path.resolve(__dirname, 'src/styles/main.scss')
  const outputDir = path.resolve(__dirname, 'public/static')
  const outputFile = path.join(outputDir, 'main.css')
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  try {
    // 编译 SCSS
    const result = sass.compile(inputFile, {
      style: 'compressed',
      loadPaths: [path.resolve(__dirname, 'node_modules')],
      quietDeps: true
    })
    
    // 写入文件
    fs.writeFileSync(outputFile, result.css)
    console.log('SCSS 编译完成，CSS 文件已生成在 public/static/main.css')
    return true
  } catch (error) {
    console.error('SCSS 编译错误:', error)
    return false
  }
}

// 在构建开始前编译 SCSS
compileSass()

// 创建 SCSS 监听器插件
const scssWatcherPlugin = (): Plugin => {
  return {
    name: 'vite-plugin-scss-watcher',
    apply: 'serve' as const, // 使用 as const 确保类型为字面量 'serve'
    configureServer(server: ViteDevServer) {
      // 使用绝对路径
      const scssGlob = path.resolve(__dirname, 'src/styles/**/*.scss')
      
      // 确保在服务器启动后添加监听器
      server.httpServer?.once('listening', () => {
        console.log('添加 SCSS 文件监听器:', scssGlob)
        
        // 使用 Vite 内部的 watcher API
        const watcher = server.watcher
        
        // 确保路径格式正确（Windows 上使用正斜杠）
        const normalizedPath = scssGlob.replace(/\\/g, '/')
        
        // 添加监听
        watcher.add(normalizedPath)
        
        // 监听变化事件
        watcher.on('change', (changedPath) => {
          if (changedPath.endsWith('.scss')) {
            console.log(`SCSS 文件变化: ${changedPath}`)
            if (compileSass()) {
              // 触发页面刷新
              server.ws.send({
                type: 'full-reload'
              })
            }
          }
        })
      })
    }
  }
}

// 创建构建插件，确保在构建时也编译 SCSS
const scssBuildPlugin = (): Plugin => {
  return {
    name: 'vite-plugin-scss-builder',
    apply: 'build',
    buildStart() {
      console.log('构建开始，编译 SCSS...')
      compileSass()
    },
    writeBundle() {
      // 确保 CSS 文件被复制到 dist/static 目录
      const srcFile = path.resolve(__dirname, 'public/static/main.css')
      const destDir = path.resolve(__dirname, 'dist/static')
      const destFile = path.join(destDir, 'main.css')
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile)
        console.log(`CSS 文件已复制到 ${destFile}`)
      } else {
        console.error(`源 CSS 文件不存在: ${srcFile}`)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    // 添加 SCSS 监听器插件（放在最前面确保优先执行）
    scssWatcherPlugin(),
    // 添加 SCSS 构建插件
    scssBuildPlugin(),
    devServer({      
      entry: 'src/app.tsx', // 修改为新的入口文件
      adapter
    }),
    build({
      entry: 'src/app.tsx' // 修改为新的入口文件
    }),
  ],
  
  // 添加对 SCSS 文件的监听配置
  server: {
    watch: {
      // 使用 chokidar 选项
      usePolling: true,
      interval: 100
    }
  }
})
