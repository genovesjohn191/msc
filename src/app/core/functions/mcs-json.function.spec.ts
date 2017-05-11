import { reviverParser } from './mcs-json.function';

describe('JSON Functions', () => {
  describe('reviverParser()', () => {
    it(`should convert JSON date type to typescript/javascript date`, () => {
      let typescriptDate = reviverParser(undefined, '2017-04-26T01:55:12Z');
      expect(typescriptDate).toEqual(jasmine.any(Date));
    });

    it(`should convert JSON string type to typescript/javascript string`, () => {
      let typescriptString = reviverParser(undefined, 'content');
      expect(typescriptString).toEqual(jasmine.any(String));
    });

    it(`should convert JSON number type to typescript/javascript number`, () => {
      let typescriptNumber = reviverParser(undefined, 1);
      expect(typescriptNumber).toEqual(jasmine.any(Number));
    });
  });
});
