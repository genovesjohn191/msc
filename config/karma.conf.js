module.exports = function (config) {
  var testWebpackConfig = require('./webpack.test.js')({ env: 'test' });

  var configuration = {

    /** Base path that will be used to resolve all patterns (e.g. files, exclude). */
    basePath: '',

    /**
     * Frameworks to Use
     *
     * Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: ['jasmine'],

    /** List of files to exclude. */
    exclude: [],

    client: {
      captureConsole: false
    },

    /**
     * List of Files / Patterns to Load in the Browser
     *
     * We are building the test environment in ./spec-bundle.js
     */
    files: [
      { pattern: './config/spec-bundle.js', watched: false },
      { pattern: './src/assets/**/*', watched: false, included: false, served: true, nocache: false }
    ],

    /**
     * By default all assets are served at http://localhost:[PORT]/base/
     */
    proxies: {
      "/assets/": "/base/src/assets/"
    },

    /**
     * Preprocess matching files before serving them to the browser.
     * Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

    /** Webpack Config at ./webpack.test.js */
    webpack: testWebpackConfig,

    coverageReporter: {
      type: 'in-memory'
    },

    remapCoverageReporter: {
      'text-summary': null,
      json: './coverage/coverage.json',
      html: './coverage/html'
    },

    /** Webpack please don't spam the console when running in karma! */
    webpackMiddleware: {
      /** Webpack-dev-middleware configuration */
      noInfo: true,
      /** And use stats to turn off verbose output */
      stats: {
        chunks: false
      }
    },

    /**
     * Test Results Reporter to Use
     *
     * Possible values: 'dots', 'progress'
     * Available reporters: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: ['mocha', 'coverage', 'remap-coverage'],

    /** Web server port */
    port: 9876,

    /** enable/disable colors in the output (reporters and logs) */
    colors: true,

    /**
     * Level of Logging
     * 
     * Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_WARN,

    /** enable / disable watching file and executing tests whenever any file changes */
    autoWatch: false,

    /**
     * Start These Browsers
     * 
     * Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: [
      'Chrome'
    ],

    customLaunchers: {
      ChromeTravisCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    /**
     * Continuous Integration Mode
     * 
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  };

  if (process.env.TRAVIS) {
    configuration.browsers = [
      'ChromeTravisCi'
    ];
  }

  config.set(configuration);
};
