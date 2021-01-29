const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const { VueLoaderPlugin } = require('vue-loader');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


const PORT = 3008;

module.exports = (env) => {
    const mode = env.mode;

    const config = {
        mode: mode,
        entry: {
            app: './src/main.js',
            main: './src/assets/css/main.css',
        },
        devServer: {
            contentBase: './dist',
            port: PORT,
            writeToDisk: true,
        },
        module: {
            rules: [
                {
                    test: /\.handlebars$/i,
                    loader: 'handlebars-loader',
                },
                {
                    test: /\.(sa|sc|c)ss$/i,
                    use: [
                        mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                    ],
                },
                {
                    test: /\.svg$/i,
                    use: 'raw-loader',
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                },
                {
                    test: /\.json$/i,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'model/[name].[contenthash].[ext]',
                                publicPath: '/',
                            }
                        },
                    ],
                },
                {
                    test: /(group).*(-shard).*$/,
                    type: 'javascript/auto',
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                publicPath: '/',
                                name: 'model/[name].[ext]',
                            }
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: true,
                __VUE_PROD_DEVTOOLS__: false,
            }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'ISP – intelligent song picker',
                template: 'src/index.handlebars',
                templateParameters: {
                    title: 'ISP – intelligent song picker',
                },
                scriptLoading: 'defer',
                hash: true,
            }),
            new HTMLInlineCSSWebpackPlugin({
                filter: (fileName) => !fileName.includes('chunk-'),
                styleTagFactory: ({ style }) => `<style type="text/css" rel="preload">${style}</style>`,
            }),
            new MiniCssExtractPlugin(),
            new VueLoaderPlugin(),
            new CompressionPlugin({
                filename: '[path][base].gz',
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'src/assets/img/icon.32.png',
                        to: 'img/icon.32.png'
                    },
                    {
                        from: 'src/assets/img/spotify-top-75-album-covers-2020.jpg',
                        to: 'img/spotify-top-75-album-covers-2020.jpg'
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                vue: '@vue/runtime-dom',
                '@': require('path').resolve(__dirname, 'src'),
            },
        },
        output: {
            filename: 'js/[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '',
        },
        optimization: {
            minimize: mode === 'development' ? false : true,
            minimizer: [
                `...`,
                new CssMinimizerPlugin(),
            ],
        },
    };

    if (mode === 'development') { 
        config.devtool = 'inline-source-map';
    }

    return config;
};
