import {
  compareMaps
} from './mcs-map.function';

describe('MAP Functions', () => {
  describe('compareMaps()', () => {
    it('should return 0 when both maps are equal', () => {
      let firstMap = new Map<string, any>();
      firstMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2' });

      let secondMap = firstMap;
      secondMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2' });

      let comparisonValue = compareMaps(firstMap, secondMap);
      expect(comparisonValue).toBe(0);
    });

    it(`should return -1 when first map has alot of data with compare to second map
      or both maps data are different`, () => {
      let firstMap = new Map<string, any>();
      firstMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2', 'sample3': 'sample3' });

      let secondMap = new Map<string, any>();
      secondMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2' });

      let comparisonValue = compareMaps(firstMap, secondMap);
      expect(comparisonValue).toBe(-1);
    });

    it(`should return not equal to 0 when second map has alot of data with compare to first map
      or both maps data are different`, () => {
      let firstMap = new Map<string, any>();
      firstMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2' });

      let secondMap = new Map<string, any>();
      secondMap.set('key', { 'sample1': 'sample1', 'sample2': 'sample2', 'sample3': 'sample3' });

      let comparisonValue = compareMaps(firstMap, secondMap);
      expect(comparisonValue).not.toBe(0);
    });
  });
});
