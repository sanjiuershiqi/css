// webpack.config.js

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader'); // 用于加载 .vue 文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 用于生成 HTML 文件并自动引入打包后的 JS
const { DefinePlugin } = require('webpack'); // 用于定义全局常量

module.exports = (env, argv) => {
  // 判断当前是生产模式还是开发模式
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development', // 设置 Webpack 模式

    // --- 入口文件 ---
    // 这是您 Vue 应用的主 JavaScript 文件
    entry: './src/main.js', 

    // --- 输出配置 ---
    output: {
      path: path.resolve(__dirname, 'dist'), // 打包后文件的存放目录
      // 根据模式生成不同的文件名，生产环境通常包含内容哈希以利于缓存控制
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].bundle.js', 
      chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      publicPath: '/', // 部署应用时的基础 URL
      clean: true, // 在每次构建前清理 /dist 文件夹
    },

    // --- 开发服务器配置 (仅在本地开发时使用) ---
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'), // 告知服务器从哪个目录提供静态文件
      },
      compress: true, // 启用 gzip 压缩
      port: 8080, // 开发服务器监听的端口
      hot: true, // 启用模块热替换 (HMR)
      historyApiFallback: true, // 对于单页应用，任何 404 响应都应服务于 index.html
      open: false, // 是否在启动后自动打开浏览器 (可以设为 true)
    },

    // --- 模块解析配置 ---
    resolve: {
      // 尝试按顺序自动解析这些扩展名
      extensions: ['.js', '.vue', '.json'], 
      alias: {
        // 创建 import 或 require 的别名
        '@': path.resolve(__dirname, 'src/'), // '@' 通常指向 'src' 目录
        // 确保使用的是包含模板编译器的 Vue 构建版本 (对 Vue 2 很重要)
        'vue$': 'vue/dist/vue.esm.js' 
      }
    },

    // --- 模块加载器 (Loaders) 配置 ---
    module: {
      rules: [
        // 处理 .vue 文件
        {
          test: /\.vue$/,
          loader: 'vue-loader' 
        },
        // 处理 .js 文件 (使用 Babel 转译)
        {
          test: /\.js$/,
          exclude: /node_modules/, // 排除 node_modules 中的 JS 文件
          use: {
            loader: 'babel-loader', // 需要配合 @babel/core, @babel/preset-env 和 babel 配置文件
            options: {
              cacheDirectory: true, // 启用缓存，提高后续构建速度
            }
          }
        },
        // 处理 .css 文件
        {
          test: /\.css$/,
          use: [
            'vue-style-loader', // 将 CSS 注入到 Vue 组件的 <style> 标签中
            'css-loader',       // 解析 CSS 文件中的 @import 和 url()
            'postcss-loader'    // (可选) 使用 PostCSS 处理 CSS (需要 postcss.config.js)
          ]
        },
        // 处理 .scss 或 .sass 文件
        {
          test: /\.s[ac]ss$/i,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader', // 可选
            'sass-loader',    // 将 Sass/SCSS 编译成 CSS (需要 sass 或 node-sass)
          ],
        },
        // 处理 .less 文件
        {
          test: /\.less$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader', // 可选
            'less-loader',    // 将 Less 编译成 CSS (需要 less)
          ],
        },
        // 处理图片文件 (使用 Webpack 5 内置的 Asset Modules)
        {
          test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
          type: 'asset/resource', // 将文件发送到输出目录并导出 URL
          generator: {
            // 定义输出的文件名格式
            filename: 'img/[name].[hash:8][ext][query]' 
          }
        },
        // 处理字体文件 (使用 Webpack 5 内置的 Asset Modules)
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext][query]'
          }
        }
      ]
    },

    // --- 插件 (Plugins) 配置 ---
    plugins: [
      // Vue Loader 必需的插件
      new VueLoaderPlugin(), 
      
      // 自动生成 HTML 文件，并注入打包后的资源
      new HtmlWebpackPlugin({
        template: './public/index.html', // 指定 HTML 模板文件
        filename: 'index.html',         // 生成的 HTML 文件名
        inject: true,                   // 自动注入所有资源
        title: 'Vue 2 Dashboard App',   // 可传递给模板的标题变量
        // favicon: './public/favicon.ico' // <--- 这一行已被移除
      }),
      
      // 定义可以在代码中访问的全局常量
      new DefinePlugin({
        // 定义 process.env.BASE_URL，通常用于 publicPath
        'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL || '/') 
      })
      // 根据需要添加其他插件，例如 MiniCssExtractPlugin, CopyWebpackPlugin 等
    ],

    // --- 优化 (Optimization) 配置 ---
    optimization: {
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunk 进行代码分割
      },
      runtimeChunk: 'single', // 为 Webpack 运行时代码创建一个单独的 chunk
    },

    // --- Source Map 配置 ---
    // 控制是否生成，以及如何生成 source map，用于调试
    devtool: isProduction ? false : 'eval-cheap-module-source-map', // 生产环境通常不生成或生成单独文件，开发环境使用较快的类型

    // --- 性能提示配置 ---
    performance: {
      // 在生产环境中，如果资源超过一定大小，给出警告
      hints: isProduction ? 'warning' : false, 
    },

    // --- Node.js Polyfills ---
    // Webpack 5 不再默认提供 Node.js 核心模块的 polyfills
    node: false, 
  };
};
