const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./src/config');
const __IS_DEV__ = process.env.NODE_ENV !== 'production';
module.exports = {
    mode: 'development',
    entry: [
        ...(__IS_DEV__ ? ['react-hot-loader/patch'] : []),
        './src/web/index.js'
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', {loader: 'sass-loader', options: {sourceMap: true}}]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [{loader: 'url-loader', options: {limit: 1}}]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{loader: 'url-loader', options: {limit: 1, minetype: 'application/font-woff'}}]
            },
            {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: [{loader: 'url-loader', options: {limit: 1}}]},
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'IS_CLIENT': true,
            'process.env.NODE_ENV': JSON.stringify(__IS_DEV__ ? '' : 'production'),
            ...(__IS_DEV__ ? {'window.CLIENT_CONFIG': JSON.stringify(config.CLIENT_CONFIG)} : {})
        }),
        ...(__IS_DEV__ ? [
            new webpack.HotModuleReplacementPlugin()
        ] : [
            new CleanWebpackPlugin(['./dist']),
            new CopyWebpackPlugin([ { from: 'src/statics', to: '.' } ], {debug: 'info'})
        ])
    ],
    ...(__IS_DEV__ ? {
        devServer: {
            contentBase: './src/statics',
            hot: true,
            host: '0.0.0.0',
            port: 3030,
            watchContentBase: true
        }
    } : {})
};