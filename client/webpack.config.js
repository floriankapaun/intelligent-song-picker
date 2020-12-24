const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');


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
                    test: /\.handlebars$/,
                    loader: 'handlebars-loader',
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        // 'postcss-loader',
                        // 'sass-loader',
                    ],
                },
                {
                    test: /\.svg$/i,
                    use: 'raw-loader',
                  },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'Facial Spotify Controller',
                template: 'src/index.handlebars',
                templateParameters: {
                    title: 'Facial Spotify Controller',
                },
                scriptLoading: 'defer',
                hash: true,
            }),
            new VueLoaderPlugin(),
        ],
        resolve: {
            alias: {
                vue: '@vue/runtime-dom',
                '@': require('path').resolve(__dirname, 'src'),
            },
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
    };

    if (mode === 'development') { 
        config.devtool = 'inline-source-map';
    } else if (mode === 'production') {
        config.plugins.push(new MiniCssExtractPlugin());
    }

    return config;
};
