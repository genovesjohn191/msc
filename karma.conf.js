// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-junit-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-coverage')
    ],
    client: {
      // Since we are only getting the actual result of unit in console,
      // it's okay to set this flag to TRUE. However,
      // in debugging mode you can set this flag to false
      // to show the relative output in your local browser.
      // Related issue on Some of your tests did a full page reload!
      // https://github.com/karma-runner/karma/issues/3560
      clearContext: true // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/fusion'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['junit', 'progress'],
    junitReporter: {
      outputDir: 'test-result',   // results will be saved as $outputDir/$browserName.xml
      outputFile: undefined,      // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: 'test-suite',        // suite will become the package name attribute in xml testsuite element
      useBrowserName: true,       // add browser name to report and classes names
      nameFormatter: undefined,   // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {},             // key value pair of properties to add to the <properties> section of the report
      xmlVersion: null            // use '1' if reporting to be per SonarQube 6.2 XML format
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome', 'ChromeHeadless', 'ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [ '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-translate',
        '--disable-extensions',
        "--js-flags=--max-old-space-size=3000"]
      }
    },
    browserNoActivityTimeout: 120000,
    singleRun: true,
    autoWatch: false,
    restartOnFileChange: true
  });
};
