'use strict';

var path = require('path'),
	os = require('os'),
	webpack = require('webpack'),
	env = process.env.NODE_ENV,
	isProduction = env === 'production';


var config = require('../config/project'),
    configWebpack = config.webpack;

var HtmlResWebpackPlugin = require('html-res-webpack-plugin'),
    Clean = require('clean-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    CopyWebpackPlugin = require("copy-webpack-plugin-hash"),
    HappyPack = require('happypack'),
    SpritesmithPlugin = require('webpack-spritesmith'),
    WebpackMd5Hash = require('webpack-md5-hash'),
    UglifyJsParallelPlugin = require('webpack-uglify-parallel');

function getOutput() {
	return {
		path: isProduction ? configWebpack.path.dist : configWebpack.path.dev
	};
}

function getModule() {
	var module = {}; 
	if (isProduction) {
		module = {
			rules: [
				{ 
	                test: /\.js$/,
	                loader: 'happypack/loader?id=1',
	                exclude: /node_modules/,
	            },
			]
		};

		var cssRules = [
			{
                test: /\.css$/,
                // 单独抽出样式文件
                loader: ExtractTextPlugin.extract({
                	fallback: 'style-loader', 
                	use: [
                		{
	                        loader: 'css-loader',
	                        options: {
	                            localIdentName: '[name]-[local]-[hash:base64:5]',
	                            root: configWebpack.path.src,
	                            module: configWebpack.cssModule
	                        }
	                    },
	                    { loader: 'postcss-loader' },
                	]
                }),
                include: path.resolve(configWebpack.path.src)
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                	fallback: 'style-loader', 
                	use: [
                		{
	                        loader: 'css-loader',
	                        options: {
	                            localIdentName: '[name]-[local]-[hash:base64:5]',
	                            module: configWebpack.cssModule
	                        }
	                    },
	                    { loader: 'postcss-loader' },
	                    {
	                        loader:  'less-loader',
	                        options: {
	                            paths: [
	                            	configWebpack.path.src,
	                            	"node_modules"
	                            ]
	                        }
	                    }
                	]
                }),
            },
            {
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
		];

		if (configWebpack.extractCss) {
			module.rules = module.rules.concat(cssRules);
		}
	}
	else {
		module = {
			rules: [
				{ 
	                test: /\.js$/,
	                loader: 'happypack/loader?id=1',
	                exclude: /node_modules/,
	            },
			]
		};
	}

	return module;
}

function getResolve() {

	if (isProduction) {
		return {};
	}
	else {
		return {}
	}
}

function getPlugins() {

	var plugins = [
		new ExtractTextPlugin({
            filename:  (getPath) => {
              return getPath('css/' + configWebpack.contenthashName + '.css').replace('css/js', 'css');
            },
            allChunks: false,
            disable: isProduction ? false : true,
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
	
	configWebpack.html.forEach(function(page, key) {
		plugins.push(new HtmlResWebpackPlugin({
			mode: "html",
	        filename: page.key + ".html",
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
}

function getExternals() {
	return {
        '$': "zepto",
    };
}

function getOtherOptions() {
	return {
		watch: isProduction ? false : true,
		devtool: isProduction ? configWebpack.sourceMap.production : configWebpack.sourceMap.development
	};
}


var webpackConfig = {
	output: getOutput(),
	module: getModule(),
	resolve: getResolve(),
	externals: getExternals(),
	plugins: getPlugins(),
};

var otherConfig = getOtherOptions();

for (let key in otherConfig) {
	webpackConfig[key] = otherConfig[key];
}

module.exports = webpackConfig;