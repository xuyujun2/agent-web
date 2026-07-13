import { defineConfig, UserConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
// @ts-ignore
// import cdnOptimizePlugin from './vite-plugin/cdn-optimize-plugin.js'

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd())

  const isProduction = mode === 'production' || mode === 'test'
  // const isProduction = mode === 'production'

  return {
    plugins: [
      vue(),
      // 使用cdn引入库
      createHtmlPlugin({
        inject: {
          tags: isProduction ? [
            {
              injectTo: 'head', // 可以是 'body-prepend', 'body-append', 'head-prepend', 'head-append'
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/vue.global.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/vue-router.global.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/lottie-player.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/crypto-js.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/demi.index.iife.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/pinia.iife.min.js'
              }
            },
            {
              injectTo: 'head',
              tag: 'script',
              attrs: {
                src: 'https://cdn.kikakeyboard.com/h5-static/js/vant.min.js'
              }
            }
          ] : []
        }
      }),
      // 自定义插件，排除 CSS 被打包
      {
        name: 'exclude-vant-css',
        enforce: 'pre',
        resolveId(id) {
          if (id.includes('vant') && id.endsWith('.css')) {
            return { id, external: true }; // 标记为外部资源
          }
          return null;
        }
      },
      // 自定义插件，把业务代码上传到cdn
      // isProduction ? cdnOptimizePlugin() : null,
    ],
    css: {
      preprocessorOptions: {
        less: { javascriptEnabled: true }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        external: isProduction ? ['vue', 'vue-router', 'vant', 'crypto-js', 'pinia'] : [],
        output: {
          // 指定外部依赖在全局作用域中的变量名
          globals: isProduction ? {
            'vue': 'Vue',
            'vue-router': 'VueRouter',
            'vant': 'vant',
            'crypto-js': 'CryptoJS',
            'pinia': 'Pinia',
          } : {},
          // manualChunks(id) {
          //   if (id.includes('node_modules')) {
          //     return id.split('node_modules/')[1].split('/')[0].toString();
          //   }
          // },
          format: 'iife'
        },
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        // 匹配所有以/v3/api开头的请求
        '/v3/api': {
          target: 'https://www-test.chatly-ai.com', //  测试环境 马甲包2
          changeOrigin: true,
          // 正确的rewrite配置（保留/v3/api前缀）
          rewrite: (path) => path.replace(/^\/v3\/api/, '/v3/api'),
          secure: false,
          ws: true,
          // 显示代理请求日志（便于调试）
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`Proxying request to: ${options.target}${req.url}`)
            })
          }
        }
      }
    }

  }
})


