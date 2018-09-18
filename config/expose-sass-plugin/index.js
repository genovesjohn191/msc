const fs = require('fs');
const sass = require('node-sass');
const helpers = require('../helpers');

// Constant Definitions
const EXPOSE_SASS_SOURCE_PATH = `${helpers.root('src')}/app`;
const EXPOSE_SASS_TARGET_PATH = `${helpers.root('dist')}/assets/css`;

// Target pages table to create styling
const targetSassComponents = [
  {
    outputFilename: 'product-catalog.min.css',
    path: '/features/products/product/product.component.scss'
  }
];

/**
 * Expose all sass based on the table derived at the top
 */
function _exposeSassStyles() {
  targetSassComponents.forEach((component) => {
    var outputPath = `${EXPOSE_SASS_TARGET_PATH}/${component.outputFilename}`;

    sass.render({
      file: `${EXPOSE_SASS_SOURCE_PATH}${component.path}`,
      outputStyle: 'compressed',
      outFile: outputPath,
    }, function (error, result) {
      if (error) { throw error; }

      // Write the css output to assets/css
      fs.writeFile(
        outputPath,
        result.css,
        (_error) => { if (_error) { throw _error; } }
      );
    });
  });
}

class ExposeSassPlugin {

  constructor() { }

  /**
   * Exposes all the converted styles based on table definition into their specified path
   * `@Note`: This will be called automatically by the plugin caller module
   * @param {*} compiler Compiler of the plugin
   */
  apply(compiler) {
    compiler.hooks.done.tapAsync('done', (_params) => {
      _exposeSassStyles();
    });
  }
}

module.exports = ExposeSassPlugin;
