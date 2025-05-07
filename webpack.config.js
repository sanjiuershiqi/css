// webpack.config.js

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader'); // 用于加载 .vue 文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 用于生成 HTML 文件并自动引入打包后的 JS
const { DefinePlugin } = require('webpack'); // 用于定义全局常量

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development', // 设置模式
    
    // 入口文件 - 这是关键的修改点
    entry: './src/main.js', // 确保指向您的 Vue 应用入口文件

    // 输出配置
    output: {
      path: path.resolve(__dirname, 'dist'), // 打包后文件的输出目录
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].bundle.js', // 打包后 JS 文件名
      chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      publicPath: '/', // 部署应用包时的基本 URL
      clean: true, // 在生成文件之前清空 output 目录
    },

    // 开发服务器配置 (如果您的模板使用 webpack-dev-server)
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'), // 静态文件目录
      },
      compress: true, // 启用 gzip 压缩
      port: 8080, // 开发服务器端口
      hot: true, // 启用热模块替换 (HMR)
      historyApiFallback: true, // 对于单页应用，所有路由都指向 index.html
      open: true, // 自动打开浏览器
    },

    // 模块解析配置
    resolve: {
      extensions: ['.js', '.vue', '.json'], // 自动解析确定的扩展名
      alias: {
        // 创建 import 或 require 的别名，来确保模块引入变得更简单
        '@': path.resolve(__dirname, 'src/'),
        'vue$': 'vue/dist/vue.esm.js' // 确保使用的是包含编译器的 Vue 版本 (对于 Vue 2 很重要)
      }
    },

    // 模块加载器配置
    module: {
      rules: [
        {
          test: /\.vue$/, // 匹配 .vue 文件
          loader: 'vue-loader' // 使用 vue-loader 处理
        },
        {
          test: /\.js$/, // 匹配 .js 文件
          exclude: /node_modules/, // 排除 node_modules 目录
          use: {
            loader: 'babel-loader', // 使用 babel-loader (需要 .babelrc 或 babel.config.js 配置文件)
            options: {
              cacheDirectory: true, // 启用缓存以提高性能
            }
          }
        },
        {
          test: /\.css$/, // 匹配 .css 文件
          use: [
            'vue-style-loader', // 或 'style-loader' (取决于您的需求和 Vue 版本)
            'css-loader',
            'postcss-loader' // (可选, 如果您使用 PostCSS 处理 CSS，例如 Autoprefixer 或 Tailwind CSS)
          ]
        },
        {
          test: /\.s[ac]ss$/i, // 匹配 .scss 或 .sass 文件
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader', // 可选
            'sass-loader',
          ],
        },
        {
          test: /\.less$/, // 匹配 .less 文件
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader', // 可选
            'less-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|ico)$/i, // 匹配图片文件
          type: 'asset/resource', // Webpack 5 的资源模块
          generator: {
            filename: 'img/[name].[hash:8][ext][query]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i, // 匹配字体文件
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash:8][ext][query]'
          }
        }
      ]
    },

    // 插件配置
    plugins: [
      new VueLoaderPlugin(), // Vue Loader 的插件，它的职责是将你定义过的其它规则复制并应用到 .vue 文件里相应语言的块
      new HtmlWebpackPlugin({
        template: './public/index.html', // 指定 HTML 模板文件路径
        filename: 'index.html', // 生成的 HTML 文件名
        inject: true, // 自动将所有产出注入到给定的 template 或 templateContent
        title: 'Vue 2 Dashboard App', // 可以传递给模板的变量
        favicon: './public/favicon.ico' // (可选, 如果您有 favicon)
      }),
      new DefinePlugin({ // 定义全局常量，在 Vue 代码中可以直接访问
        'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL || '/')
      })
    ],

    // 优化配置 (例如代码分割)
    optimization: {
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunks 进行代码分割 (initial, async)
      },
      runtimeChunk: 'single', // 为运行时代码创建一个单独的 chunk
    },

    // Source Map 配置 (用于调试)
    devtool: isProduction ? false : 'eval-cheap-module-source-map',

    // 性能提示配置
    performance: {
      hints: isProduction ? 'warning' : false, // 在生产环境中，当 bundle 大小超过限制时显示警告
    },

    // 禁用 Node.js 核心模块的 polyfills (Webpack 5 默认行为)
    // 如果您的代码或依赖项依赖这些模块，可能需要手动提供 polyfills
    node: false, 
  };
};
