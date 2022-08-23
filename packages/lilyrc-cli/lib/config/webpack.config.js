'use strict';
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

const paths = require('./paths');

const clientEnvironment = require('./env');
const env = clientEnvironment();
module.exports = function (webpackEnv, runConfig = {}) {
  const { outputPath = '', publicPath, copy = [] } = runConfig;
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const getStyleLoaders = ({ modules = true }) =>
    [
      isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: modules
            ? {
                localIdentName: '[name]-[local]-[hash:base64:5]',
              }
            : false,
        },
      },
      'postcss-loader',
      'less-loader',
    ].filter(Boolean);

  const entry = { app: paths.appIndex };
  let webpackConfig = {
    target: ['browserslist'],
    devtool: isEnvDevelopment ? 'inline-source-map' : 'source-map',
    mode: isEnvProduction ? 'production' : 'development',
    entry,
    output: {
      path: paths.appDist + outputPath,
      publicPath: publicPath || '/',
      filename: `static/js/[name]${
        isEnvProduction ? '.[contenthash:8]' : ''
      }.js`,
      clean: true,
    },
    cache: {
      type: 'filesystem',
      store: 'pack',
      cacheDirectory: paths.appWebpackCache,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          include: paths.appSrc,
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  targets: {
                    chrome: '49',
                    ios: '10',
                  },
                },
              ],
              '@babel/typescript',
              '@babel/preset-react',
            ],
            plugins: [
              isEnvDevelopment && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
            babelrc: false,
          },
        },
        {
          test: /\.(le|c)ss$/,
          use: getStyleLoaders({ modules: true }),
          include: paths.appSrc,
        },
        {
          test: /\.css$/,
          use: getStyleLoaders({ modules: false }),
          include: paths.appNodeModules,
        },
        {
          test: /\.(gif|png|jpe?g|svg)(\?.*)?$/,
          type: 'asset',
          generator: {
            filename: 'static/img/[name][ext]?[hash]',
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024,
            },
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          type: 'asset/resource',
          include: [paths.appSrc],
          generator: {
            filename: 'fonts/[name].[hash:7][ext]',
          },
        },
      ],
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              inline: 2,
            },
            output: {
              comments: false,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minChunks: 2,
        cacheGroups: {
          dll: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'dll',
            priority: 100,
            enforce: true,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2, // Math.ceil(pages.length / 3), 当你有多个页面时，获取pages.length，至少被1/3页面的引入才打入common包
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: true,
    },
    plugins: [
      new webpack.DefinePlugin(env),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            filename: 'index.html',
            template: paths.appHtml,
            favicon: 'favicon.ico',
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
      new webpack.ProgressPlugin(),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:10].css',
        }),
      isEnvDevelopment && new ReactRefreshPlugin({ overlay: false }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'favicon.ico',
          },
          // {
          //   from: 'public',
          // },
          ...copy,
        ],
      }),
      process.env.NODE_ENV_REPORT && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
    performance: {
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@': paths.appSrc,
      },
      modules: ['node_modules', paths.appNodeModules], // 默认是当前目录下的 node_modules
    },
  };

  if (process.env.NODE_ENV_REPORT) {
    webpackConfig = smp.wrap(webpackConfig);
  }
  return webpackConfig;
};
