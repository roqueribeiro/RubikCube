const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    entry: ['./src/app.js', './src/reset.scss', './src/style.scss'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name]-[hash].js",
    },
    devServer: {
        port: 3000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.pug'
        }),
        new MiniCssExtractPlugin({
            filename: "[name]-[hash].css",
            chunkFilename: "[id]-[hash].css"
        })
    ],
    module: {
        rules: [{
            test: /\.pug$/,
            use: ['pug-loader']
        }, {
            test: /\.s?css$/,
            exclude: /node_modules/, 
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'sass-loader'
            ]
        }, {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader'
            ]
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: ['file-loader']
        }]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
            })
        ]
    }
};
module.exports = (env, argv) => {
    if (argv.mode === 'development') {}
    if (argv.mode === 'production') {}
    return config;
}