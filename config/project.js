'use strict';

const path = require('path'),
      os = require('os'),
      webpack = require('webpack'),
      utils = require('steamer-webpack-utils'),
      steamerConfig = require('./steamer.config'),
      __basename = path.dirname(__dirname),
      __env = process.env.NODE_ENV,
      isProduction = __env === 'production';

var srcPath = path.resolve(__basename, "src"),
    devPath = path.resolve(__basename, "dev"),
    distPath = path.resolve(__basename, "dist"),
    spritePath = path.resolve(__basename, "src/img/sprites");

var hash = "[hash:6]",
    chunkhash = "[chunkhash:6]",
    contenthash = "[contenthash:6]";

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HappyPack = require('happypack');

var config = {
    // ========================= webpack环境配置 =========================
    env: __env,

    // ========================= webpack服务器及路由配置 =========================
    // 开发服务器配置
    webserver: steamerConfig.webserver,
    cdn: steamerConfig.cdn,
    port: steamerConfig.port,    // port for local server
    route: steamerConfig.route, // http://host/news/

    webpack: {

        // ========================= webpack快捷配置 =========================
        // 是否清理生成文件夹
        clean: true,
        // sourcemap
        sourceMap: {
            development: "inline-source-map",
            production: false,
        },

        // 样式
        style: [
            "css", "less", "stylus"
        ],
        // 生产环境是否提取css
        extractCss: true,
        // 是否启用css模块化
        cssModule: false,

        // 合图，mobile = 2倍图，pc = 1倍图
        spriteMode: "mobile",
        // less, stylus
        spriteStyle: "less",

        // html模板
        template: [
            "html", "pug", "handlebars"
        ],

        // 资源是否压缩
        compress: true,

        // 不经webpack打包的资源
        static: [
            {
                src: "libs/",
                hash: true,
            }
        ],

        // ========================= webpack入口entry文件 =========================
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

        // ========================= webpack路径与文件名 =========================
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

        // ========================= webpack自定义配置 =========================
        // webpack output
        getOutput: function() {
            return {};
        },

        // webpack module
        getModule: function() {

            var module = {
                rules: [
                    { 
                        test: /\.js$/,
                        loader: 'happypack/loader?id=1',
                        exclude: /node_modules/,
                    }
                ]
            }; 

            var styleRules = {
                css: {
                    test: /\.css$/,
                    // 单独抽出样式文件
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader', 
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    localIdentName: '[name]-[local]-[hash:base64:5]',
                                    root: this.path.src,
                                    module: this.cssModule
                                }
                            },
                            { loader: 'postcss-loader' },
                        ]
                    }),
                    include: path.resolve(this.path.src)
                },
                less: {
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader', 
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    localIdentName: '[name]-[local]-[hash:base64:5]',
                                    module: this.cssModule
                                }
                            },
                            { loader: 'postcss-loader' },
                            {
                                loader:  'less-loader',
                                options: {
                                    paths: [
                                        this.path.src,
                                        "node_modules"
                                    ]
                                }
                            }
                        ]
                    }),
                },
                stylus: {
                    test: /\.styl$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader', 
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    localIdentName: '[name]-[local]-[hash:base64:5]',
                                    // module: true
                                }
                            },
                            { loader: 'postcss-loader' },
                            { loader:  'stylus-loader' },
                        ]
                    }),
                },
            };

            var templateRules = {
                html: {
                    test: /\.html$/,
                    loader: 'html-loader'
                },
                pug: {
                    test: /\.pug$/, 
                    loader: 'pug-loader'
                },
                handlebars: { 
                    test: /\.handlebars$/, 
                    loader: "handlebars-loader" 
                },  
            };

            this.style.forEach((style) => {
                let rule = styleRules[style] || '';
                rule && module.rules.push(rule);
            });

            this.template.forEach((tpl) => {
                let rule = templateRules[tpl] || '';
                rule && module.rules.push(rule);
            });

            return module;
        },

        // webpack resolve
        getResolve: function() {
            return {};
        },

        // webpack plugins
        getPlugins: function() {
            var plugins = [
                new ExtractTextPlugin({
                    filename:  (getPath) => {
                      return getPath('css/' + this.contenthashName + '.css').replace('css/js', 'css');
                    },
                    allChunks: false,
                    disable: (isProduction || !this.extractCss) ? false : true,
                }),
                new HappyPack({
                    id: '1',
                    verbose: false,
                    loaders: [{
                        path: 'babel-loader',
                        options: {
                            cacheDirectory: './.webpack_cache/',
                            presets: [
                                ["es2015", {"loose": true}],
                            ]
                        },
                    }],
                })
            ];
            
            this.html.forEach(function(page, key) {
                plugins.push(new HtmlResWebpackPlugin({
                    mode: "html",
                    filename: isProduction ? ("../webserver/" + page.key + ".html") : page.key + ".html",
                    template: page.path,
                    favicon: "src/favicon.ico",
                    htmlMinify: null,
                    entryLog: !key ? true : false,
                    templateContent: function(tpl) {
                        return tpl;
                    }
                }))
            }); 

            return plugins;
        },
            
        // webpack externals
        getExternals: function() {
            return {
                '$': "zepto",
            };
        },

        // other webpack options
        getOtherOptions: function() {
            return {};
        }
    },
};

module.exports = config;