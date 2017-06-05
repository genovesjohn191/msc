import {
  mergeArrays,
  updateArrayRecord
} from './mcs-array.function';

// Dummy class
export class TestStructure {
  public key: string;
  public value: string;

  constructor(testKey: string, testValue: string) {
    this.key = testKey;
    this.value = testValue;
  }
}

describe('ARRAY Functions', () => {
  describe('mergeArrays()', () => {
    it(`should merge/join both arrays when the predicate is undefined`, () => {
      let firstArray: TestStructure[] = new Array();
      let secondArray: TestStructure[] = new Array();

      firstArray.push(new TestStructure('1', 'hello1'));
      firstArray.push(new TestStructure('2', 'hello2'));
      secondArray.push(new TestStructure('3', 'hello3'));
      secondArray.push(new TestStructure('4', 'hello4'));

      let mergedArray = mergeArrays(firstArray, secondArray);
      expect(mergedArray.length).toEqual(4);
    });

    it(`should merge both arrays and update the item value according to predicate`, () => {
      let firstArray: TestStructure[] = new Array();
      let secondArray: TestStructure[] = new Array();

      firstArray.push(new TestStructure('1', 'hello1'));
      firstArray.push(new TestStructure('2', 'hello2'));
      secondArray.push(new TestStructure('1', 'hello3'));
      secondArray.push(new TestStructure('4', 'hello4'));

      let mergedArray = mergeArrays(
        firstArray,
        secondArray,
        (first: TestStructure, second: TestStructure) => {
          return first.key === second.key;
        });
      expect(mergedArray.length).toEqual(3);
    });
  });

  describe('updateArrayRecord()', () => {
    it(`should append the array record when the predicate is undefined`, () => {
      let arrayRecord: TestStructure[] = new Array();
      let updatedElement: TestStructure = new TestStructure('1', '2');

      arrayRecord.push(new TestStructure('1', 'hello1'));
      let mergedArray = updateArrayRecord(arrayRecord, updatedElement);
      expect(mergedArray.length).toEqual(2);
    });

    it(`should update the array record when the predicate is defined`, () => {
      let arrayRecord: TestStructure[] = new Array();
      let updatedElement: TestStructure = new TestStructure('1', '2');

      arrayRecord.push(new TestStructure('1', 'hello1'));
      let mergedArray = updateArrayRecord(
        arrayRecord,
        updatedElement,
        (first: TestStructure, second: TestStructure) => {
          return first.key === second.key;
        }
      );
      expect(mergedArray.length).toEqual(1);
    });
  });
});
