
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
	if (isProduction) {
		return {
			rules: [
				{ 
	                test: /\.js$/,
	                loader: 'happypack/loader?id=1',
	                exclude: /node_modules/,
	            },
				{
	                test: /\.css$/,
	                // 单独抽出样式文件
	                loader: ExtractTextPlugin.extract({
	                	fallback: 'style-loader', 
	                	use: 'css-loader!postcss-loader'
	                }),
	                include: path.resolve(configWebpack.path.src)
	            },
	            {
	                test: /\.less$/,
	                loader: ExtractTextPlugin.extract({
	                	fallback: 'style-loader', 
	                	use: 'css-loader?-autoprefixer&localIdentName=[name]-[local]-[hash:base64:5]!postcss-loader!less-loader?root=' + path.resolve('src')
	                }),
	            },
	            {
	                test: /\.styl$/,
	                loader: ExtractTextPlugin.extract({
	                	fallback: 'style-loader', 
	                	use: 'css-loader?-autoprefixer&localIdentName=[name]-[local]-[hash:base64:5]!postcss-loader!stylus-loader'
	                }),
	            },
			]
		}
	}
	else {
		return {
			rules: [
				{ 
	                test: /\.js$/,
	                loader: 'happypack/loader?id=1',
	                exclude: /node_modules/,
	            },
			]
		};
	}
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
		new Clean([isProduction ? 'dist' : 'dev'], {root: path.resolve()}),
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


	if (isProduction) {
		plugins.push(new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(config.env)
            }
        }));
        plugins.push(new UglifyJsParallelPlugin({
            workers: os.cpus().length, // usually having as many workers as cpu cores gives good results 
            // other uglify options 
            compress: {
                warnings: false,
            },
        }));
        plugins.push(new WebpackMd5Hash());
	}
	else {
		plugins.push(new webpack.HotModuleReplacementPlugin());
	}
	
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
	            'less': path.join(__dirname, '../tools/', './sprite-template/less.template.handlebars'),
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

	};
}


module.exports = {
	output: getOutput(),
	module: getModule(),
	resolve: getResolve(),
	externals: getExternals(),
	plugins: getPlugins(),
	watch: isProduction ? false : true,
};