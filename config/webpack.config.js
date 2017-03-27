
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
		return {

		};
	}
	else {
		return {

		}
	}
}

function getPlugins() {

	var plugins = [
		new ExtractTextPlugin({
            filename:  (getPath) => {
              return getPath('css/' + configWebpack.contenthashName + '.css').replace('css/js', 'css');
            },
            allChunks: true,
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

	if (configWebpack.clean) {
		plugins.push(new Clean([isProduction ? 'dist' : 'dev'], {root: path.resolve()}));
	}


	if (isProduction) {
		plugins.push(new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(config.env)
            }
        }));
        plugins.push(new WebpackMd5Hash());

       	if (configWebpack.compress) {
       		plugins.push(new UglifyJsParallelPlugin({
	            workers: os.cpus().length, // usually having as many workers as cpu cores gives good results 
	            // other uglify options 
	            compress: {
	                warnings: false,
	            },
	        }));
       	}
	}
	else {
		plugins.push(new webpack.HotModuleReplacementPlugin());
	}

	configWebpack.static.forEach((item) => {
        plugins.push(new CopyWebpackPlugin([{
            from: item.src,
            to: (item.dist || item.src) + (item.hash ? configWebpack.hashName : "[name]") + '.[ext]'
        }]));
	});
	
	configWebpack.html.forEach(function(page, key) {
		plugins.push(new HtmlResWebpackPlugin({
			mode: "html",
	        filename: page.key + ".html",
	        template: page.path,
	        favicon: "src/favicon.ico",
	        // chunks: configWebpack.htmlres.dev[page],
	        htmlMinify: null,
	        entryLog: !key ? true : false,
	        templateContent: function(tpl) {
	            return tpl;
	        }
		}))
	}); 

	configWebpack.sprites.forEach(function(sprites) {
		plugins.push(new SpritesmithPlugin({
			src: {
	            cwd: sprites.path,
	            glob: '*.png'
	        },
	        target: {
	            image: path.join(configWebpack.path.src, "css/sprites/" + sprites.key + ".png"),
	            css: path.join(configWebpack.path.src, "css/sprites/" + sprites.key + ".less")
	        },
	        spritesmithOptions: {
	            padding: 10
	        },
	        customTemplates: {
	            'less': path.join(__dirname, '../tools/', './sprite-template/less.template.mobile.handlebars'),
	        },
	        apiOptions: {
	            cssImageRef: sprites.key + ".png"
	        }
		}));
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