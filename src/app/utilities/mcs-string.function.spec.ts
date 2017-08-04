import {
  getProperCase,
  getEncodedUrl,
  replacePlaceholder
} from './mcs-string.function';

describe('STRING Functions', () => {
  describe('getProperCase()', () => {
    it(`should return the proper case of the inputted string`, () => {
      let propercaseContent = getProperCase('hello');
      expect(propercaseContent).toBe('Hello');
    });
  });

  describe('getEncodedUrl()', () => {
    it(`should return the encoded URL based on the inputted file information`, () => {
      let file: string = 'casdtfAAAAsssd';
      let fileType: string = 'image/png';
      let encoding: string = 'base64';
      let expectedUrl: string = `data:${fileType};${encoding},${file}`;

      let encodedUrl = getEncodedUrl(file, fileType, encoding);
      expect(encodedUrl).toBe(expectedUrl);
    });
  });

  describe('replacePlaceholder()', () => {
    it(`should replace the placeholder based on the given content`, () => {
      let stringContent = 'hello {{name}}';
      let replacedString = replacePlaceholder(stringContent, 'name', 'arrian');
      expect(replacedString).toBe(stringContent.replace('{{name}}', 'arrian'));
    });
  });
});
