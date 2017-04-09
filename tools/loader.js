"use strict";

// 用于生成自定义的webpack loader

var loaders = {
	stylus: {
		devDependencies: {
			"stylus": "^0.54.5",
    		"stylus-loader": "^2.4.0",
		},
		loader: stylus: {
	        test: /\.styl$/,
	        loader: ExtractTextPlugin.extract({
	            fallback: 'style-loader', 
	            use: [
	                {
	                    loader: 'css-loader',
	                    options: {
	                        localIdentName: '[name]-[local]-[hash:base64:5]',
	                        module: config.webpack.cssModule
	                    }
	                },
	                { loader: 'postcss-loader' },
	                { 
	                    loader:  'stylus-loader',
	                    options: {
	                        paths: [
	                            config.webpack.path.src,
	                            "node_modules"
	                        ]
	                    }
	                },
	            ]
	        }),
	    },
	}
};