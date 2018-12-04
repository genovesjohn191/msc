const helpers = require('./helpers');
const buildUtils = require('./build-utils');

/**
 * Used to merge webpack configs
*/
const webpackMerge = require('webpack-merge');
/**
 * The settings that are common to prod and dev
*/
const commonConfig = require('./webpack.common.js');

/**
 * Webpack Plugins
 */
const SourceMapDevToolPlugin = require('webpack/lib/SourceMapDevToolPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssSafeParser = require('postcss-safe-parser');
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin')
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExposeSassPlugin = require('./expose-sass-plugin');

function getUglifyOptions(supportES2015) {
  const uglifyCompressOptions = {
    pure_getters: true, /* buildOptimizer */
    // PURE comments work best with 3 passes.
    // See https://github.com/webpack/webpack/issues/2899#issuecomment-317425926.
    passes: 3         /* buildOptimizer */
  };

  return {
    ecma: supportES2015 ? 6 : 5,
    warnings: false,    // TODO verbose based on option?
    ie8: false,
    mangle: true,
    compress: uglifyCompressOptions,
    output: {
      ascii_only: true,
      comments: false
    }
  };
}

module.exports = function (env) {
  const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
  const API_URL = process.env.MCS_API_URL || undefined;
  const HOST = process.env.MCS_HOST || undefined;
  const PORT = process.env.MCS_PORT || undefined;
  const SENTRY_DSN = process.env.MCS_SENTRY_DSN || undefined;
  const MACVIEW_URL = process.env.MACVIEW_URL || undefined;
  const LOGIN_URL = process.env.MCS_LOGIN_URL || undefined;
  const LOGOUT_URL = process.env.MCS_LOGOUT_URL || undefined;
  const MACVIEW_ORDERS_URL = process.env.MCS_MACVIEW_MACVIEW_ORDERS_URL || undefined;
  const MACVIEW_CHANGE_PASSWORD_URL = process.env.MCS_MACVIEW_MACVIEW_CHANGE_PASSWORD_URL || undefined;
  const ENABLE_PASSING_JWT_IN_URL = process.env.MCS_ENABLE_PASSING_JWT_IN_URL || undefined;
  const JWT_COOKIE_NAME = process.env.MCS_JWT_COOKIE_NAME || undefined;
  const JWT_REFRESH_TOKEN_COOKIE_NAME = process.env.MCS_JWT_REFRESH_TOKEN_COOKIE_NAME || undefined;
  const IMAGE_URL = process.env.MCS_IMAGE_URL || undefined;
  const ICON_URL = process.env.MCS_ICON_URL || undefined;
  const EK = process.env.MCS_EK || undefined;

  const supportES2015 = buildUtils.supportES2015(buildUtils.DEFAULT_METADATA.tsConfigPath);
  const METADATA = Object.assign({}, buildUtils.DEFAULT_METADATA, {
    host: HOST,
    port: PORT,
    API_URL: API_URL,
    ENV: ENV,
    HMR: false,
    SENTRY_DSN: SENTRY_DSN,
    MACVIEW_URL: MACVIEW_URL,
    LOGIN_URL: LOGIN_URL,
    LOGOUT_URL: LOGOUT_URL,
    MACVIEW_ORDERS_URL: MACVIEW_ORDERS_URL,
    MACVIEW_CHANGE_PASSWORD_URL: MACVIEW_CHANGE_PASSWORD_URL,
    ENABLE_PASSING_JWT_IN_URL: ENABLE_PASSING_JWT_IN_URL,
    JWT_COOKIE_NAME: JWT_COOKIE_NAME,
    JWT_REFRESH_TOKEN_COOKIE_NAME: JWT_REFRESH_TOKEN_COOKIE_NAME,
    IMAGE_URL: IMAGE_URL,
    ICON_URL: ICON_URL,
    EK: EK
  });

  // set environment suffix so these environments are loaded.
  METADATA.envFileSuffix = METADATA.E2E ? 'e2e.prod' : 'prod';

  return webpackMerge(commonConfig({ env: ENV, metadata: METADATA }), {
    /**
     * Sets the mode of the webpack
     *
     * See: https://webpack.js.org/concepts/mode/
     */
    mode: ENV,
    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].[chunkhash].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[file].map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[name].[chunkhash].chunk.js'

    },

    module: {

      rules: [
        /**
         * Extract and compile Styling files from .src/styles directory to external CSS file
         */
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ],
          include: [helpers.root('src', 'styles')]
        }
      ]

    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [

      new SourceMapDevToolPlugin({
        filename: '[file].map[query]',
        moduleFilenameTemplate: '[resource-path]',
        fallbackModuleFilenameTemplate: '[resource-path]?[hash]',
        sourceRoot: 'webpack:///'
      }),


      /**
       * Plugin: MiniCssExtractPlugin
       * Description: Extracts imported CSS files into external stylesheet
       *
       * See: https://github.com/webpack-contrib/mini-css-extract-plugin
       */
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css'
      }),

      /**
       * Optimze CSS Assets to minimize their bundlings
       */
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.(css|scss)$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          parser: CssSafeParser,
          discardComments: {
            removeAll: true
          }
        },
        canPrint: true
      }),

      new HashedModuleIdsPlugin(),
      new ModuleConcatenationPlugin(),
      new ExposeSassPlugin(),

      /**
       * Plugin: UglifyJsPlugin
       * Description: Minimize all JavaScript output of chunks.
       * Loaders are switched into minimizing mode.
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
       *
       * NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
       */
      new UglifyJsPlugin({
        sourceMap: false,
        uglifyOptions: getUglifyOptions(supportES2015)
      })
    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  });
}
