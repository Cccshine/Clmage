var webpack = require('webpack');
var path = require('path');
//使用 ExtractTextWebpackPlugin (将打好包的 CSS 提出出来并输出成 CSS 文件)。
var extractTextPlugin = require('extract-text-webpack-plugin');
//在热更新模式下，编译完成后自动打开浏览器
var openBrowserPlugin = require('open-browser-webpack-plugin');

var plugins = [
	new webpack.HotModuleReplacementPlugin(),
	new extractTextPlugin({ filename: 'cimage.css' }),
	new openBrowserPlugin({ url: 'http://localhost:8080/' })
];
module.exports = {
	//配置服务器//详细见https://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli
	devServer: {
		//浏览器刷新时所有的路径都执行index.html。
		historyApiFallback: true,
		//热更新
		// hot:true,
		//自动刷新模式为内联模式（还有iframe模式）
		inline: true,
		//设定webpack-dev-server伺服的directory。如果不进行设定的话，默认是在当前目录下
		// contentBase:'./public',
		port: 8080
	},
	//在控制台的sources下，点开可以看到webpack://目录，里面可以直接看到我们开发态的源代码，这样方便我们直接在浏览器中打断点调试
	devtool: process.env.NODE_ENV === 'development' ? "cheap-module-source-map" : "source-map",
	entry: path.resolve(__dirname, './src/CImage.js'),
	output: {
		// path:__dirname+'/dist',
		publicPath: '/dist/',
		filename: 'CImage.min.js',
		library: 'CImage',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: path.resolve(__dirname, 'src'),
				options: {
					presets: ['es2015']
				}
			},
			{
				test: /\.less$/,
				include: path.resolve(__dirname, 'src'),
				use: extractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: (loader) => [
									require('autoprefixer'),
								],
								sourceMap: true
							}
						},
						{
							loader: 'less-loader',
							options: {
								sourceMap: true,
								outputStyle: 'expanded'
							}
						}
					]
				})
			},
			{
				test: /\.(png|jpg)$/,
				use: {
					loader: 'url-loader',//名称
					options: {//其他配置选项
						limit: 8192,
						name: '/images/[name].[ext]'
					}
				}
			},
		]
	},
	plugins: plugins
};