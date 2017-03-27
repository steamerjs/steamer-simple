'use strict';

const path = require('path'),
      utils = require('steamer-webpack-utils'),
      __basename = path.dirname(__dirname),
      __env = process.env.NODE_ENV,
      isProduction = __env === 'production',
      steamerConfig = require('./steamer.config');

var srcPath = path.resolve(__basename, "src"),
    devPath = path.resolve(__basename, "dev"),
    distPath = path.resolve(__basename, "dist"),
    spritePath = path.resolve(__basename, "src/img/sprites");

var hash = "[hash:6]",
    chunkhash = "[chunkhash:6]",
    contenthash = "[contenthash:6]";


var config = {
    env: __env,
    webpack: {
        // 根据约定，自动扫描js entry，约定是src/page/xxx/main.js 或 src/page/xxx/main.jsx
        /** 
            当前获取结果
            {
                'js/index': [path.join(configWebpack.path.src, "/page/index/main.js")],
                'js/spa': [path.join(configWebpack.path.src, "/page/spa/main.js")],
                'js/pindex': [path.join(configWebpack.path.src, "/page/pindex/main.jsx")],
            }
         */
        entry: utils.getJsEntry({
            srcPath: path.join(srcPath, "page"), 
            fileName: "main",
            extensions: ["js", "jsx"],
            keyPrefix: "js/",
            level: 1
        }),

        // 自动扫描html
        html: utils.getHtmlEntry({
            srcPath: path.join(srcPath, "page"),
            level: 1
        }),

        // 自动扫描合图
        sprites: utils.getSpriteEntry({
            srcPath: spritePath
        }),
        // 合图，mobile = 2倍图，pc = 1倍图
        spriteMode: "mobile",
        // less, stylus
        spriteStyle: "less",

        // 项目路径
        path: {
            src: srcPath,
            dev: devPath,
            dist: distPath,
            sprite: spritePath,
        },

        // hash and name with hash
        hash: hash,
        chunkhash: chunkhash,
        contenthash: contenthash,
        hashName: isProduction ? ("[name]-" + hash) : "[name]",
        chunkhashName: isProduction ? ("[name]-" + chunkhash) : "[name]",
        contenthashName: isProduction ? ("[name]-" + contenthash) : "[name]",

        // webpack其它个性化定制配置
        // 是否清理生成文件夹
        clean: true,
        // sourcemap
        sourceMap: {
            development: "inline-source-map",
            production: false,
        },
        // 生产环境是否提取css
        extractCss: true,
        // 是否启用css模块化
        cssModule: false,
        // 资源是否压缩
        compress: true,
        // 不经webpack打包的资源
        static: [
            {
                src: "libs/",
                hash: true,
            }
        ],
        
    },

    // 开发服务器配置
    webserver: steamerConfig.webserver,
    cdn: steamerConfig.cdn,
    port: steamerConfig.port,    // port for local server
    route: steamerConfig.route  // http://host/news/
};

module.exports = config;