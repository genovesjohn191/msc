import {
  mergeArrays,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  clearArrayRecord,
  compareArrays,
  getArrayCount,
  isArray
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

  describe('addOrUpdateArrayRecord()', () => {
    it(`should append the array record when the predicate is undefined
    and updateOnly is true`, () => {
        let arrayRecord: TestStructure[] = new Array();
        let updatedElement: TestStructure = new TestStructure('1', '2');

        arrayRecord.push(new TestStructure('1', 'hello1'));
        let mergedArray = addOrUpdateArrayRecord(arrayRecord, updatedElement, false);
        expect(mergedArray.length).toEqual(2);
      });

    it(`should append the array record when the updateOnly flag is false`, () => {
      let arrayRecord: TestStructure[] = new Array();
      let updatedElement: TestStructure = new TestStructure('1', '2');

      arrayRecord.push(new TestStructure('1', 'hello1'));
      let mergedArray = addOrUpdateArrayRecord(arrayRecord, updatedElement, false);
      expect(mergedArray.length).toEqual(2);
    });

    it(`should not append the array record when the updateOnly flag is true`, () => {
      let arrayRecord: TestStructure[] = new Array();
      let updatedElement: TestStructure = new TestStructure('1', '2');

      arrayRecord.push(new TestStructure('1', 'hello1'));
      let mergedArray = addOrUpdateArrayRecord(arrayRecord, updatedElement, true);
      expect(mergedArray.length).toEqual(1);
    });

    it(`should update the array record when the predicate is defined`, () => {
      let arrayRecord: TestStructure[] = new Array();
      let updatedElement: TestStructure = new TestStructure('1', '2');

      arrayRecord.push(new TestStructure('1', 'hello1'));
      let mergedArray = addOrUpdateArrayRecord(
        arrayRecord,
        updatedElement,
        false,
        (first: TestStructure, second: TestStructure) => {
          return first.key === second.key;
        }
      );
      expect(mergedArray.length).toEqual(1);
    });

    it(`should add the record at the end of the array
      when the insertIndex is not set`, () => {
        let arrayRecord: TestStructure[] = [
          new TestStructure('1', 'hello'),
          new TestStructure('2', 'world')
        ];
        let updatedElement: TestStructure = new TestStructure('3', 'earth');

        let mergedArray = addOrUpdateArrayRecord(
          arrayRecord, updatedElement, false);
        expect(mergedArray.length).toEqual(3);
        expect(mergedArray[2]).toEqual(updatedElement);
      });

    it(`should add the record to the set index value
      when  insertIndex is set`, () => {
        let insertIndex = 1;
        let arrayRecord: TestStructure[] = [
          new TestStructure('1', 'hello'),
          new TestStructure('2', 'world')
        ];
        let updatedElement: TestStructure = new TestStructure('3', 'earth');

        let mergedArray = addOrUpdateArrayRecord(
          arrayRecord, updatedElement, false, undefined, insertIndex);
        expect(mergedArray.length).toEqual(3);
        expect(mergedArray[insertIndex]).toEqual(updatedElement);
      });
  });

  describe('deleteArrayRecord()', () => {
    it(`should delete the record from the array list based on predicate`, () => {
      let listItems: TestStructure[] = new Array();

      listItems.push(new TestStructure('1', 'hello1'));
      listItems.push(new TestStructure('2', 'hello1'));
      listItems.push(new TestStructure('3', 'hello2'));

      deleteArrayRecord(listItems, (record) => {
        return record.value === 'hello1';
      });
      expect(listItems.length).toEqual(1);
    });

    it(`should delete the record from the array list based on predicate and item count`, () => {
      let listItems: TestStructure[] = new Array();

      listItems.push(new TestStructure('1', 'hello1'));
      listItems.push(new TestStructure('2', 'hello1'));
      listItems.push(new TestStructure('3', 'hello2'));

      deleteArrayRecord(listItems, (record) => {
        return record.value === 'hello1';
      }, 1);
      expect(listItems.length).toEqual(2);
    });
  });

  describe('clearArrayRecord()', () => {
    it(`should clear the array records`, () => {
      let listItems: TestStructure[] = new Array();

      listItems.push(new TestStructure('1', 'hello1'));
      listItems.push(new TestStructure('2', 'hello1'));
      listItems.push(new TestStructure('3', 'hello2'));

      clearArrayRecord(listItems);
      expect(listItems.length).toEqual(0);
    });
  });

  describe('compareArrays()', () => {
    it(`should return -1 when the first array has larger content
    with compare to second array`, () => {
        let firstArray: TestStructure[] = new Array();
        let secondArray: TestStructure[] = new Array();
        let comparisonResult: number;

        firstArray.push(new TestStructure('1', 'hello1'));
        firstArray.push(new TestStructure('2', 'hello1'));
        firstArray.push(new TestStructure('3', 'hello2'));
        firstArray.push(new TestStructure('4', 'hello2'));

        secondArray.push(new TestStructure('1', 'hello1'));
        secondArray.push(new TestStructure('2', 'hello1'));
        secondArray.push(new TestStructure('3', 'hello2'));

        comparisonResult = compareArrays(firstArray, secondArray, (_first, _second) => {
          return _first.key === _second.key;
        });
        expect(comparisonResult).toEqual(-1);
      });

    it(`should return 1 when the second array has larger content
    with compare to first array`, () => {
        let firstArray: TestStructure[] = new Array();
        let secondArray: TestStructure[] = new Array();
        let comparisonResult: number;

        firstArray.push(new TestStructure('1', 'hello1'));
        firstArray.push(new TestStructure('2', 'hello1'));
        firstArray.push(new TestStructure('3', 'hello2'));

        secondArray.push(new TestStructure('1', 'hello1'));
        secondArray.push(new TestStructure('2', 'hello1'));
        secondArray.push(new TestStructure('3', 'hello2'));
        secondArray.push(new TestStructure('4', 'hello2'));

        comparisonResult = compareArrays(firstArray, secondArray, (_first, _second) => {
          return _first.key === _second.key;
        });
        expect(comparisonResult).toEqual(1);
      });

    it(`should return 0 when both arrays are the same`, () => {
      let firstArray: TestStructure[] = new Array();
      let secondArray: TestStructure[] = new Array();
      let comparisonResult: number;

      firstArray.push(new TestStructure('1', 'hello1'));
      firstArray.push(new TestStructure('2', 'hello1'));
      firstArray.push(new TestStructure('3', 'hello2'));

      secondArray.push(new TestStructure('1', 'hello1'));
      secondArray.push(new TestStructure('2', 'hello1'));
      secondArray.push(new TestStructure('3', 'hello2'));

      comparisonResult = compareArrays(firstArray, secondArray, (_first, _second) => {
        return _first.key === _second.key;
      });

      expect(comparisonResult).toEqual(0);
    });

    it(`should return -2 when both array records are not the same`, () => {
      let firstArray: TestStructure[] = new Array();
      let secondArray: TestStructure[] = new Array();
      let comparisonResult: number;

      firstArray.push(new TestStructure('1', 'hello1'));
      firstArray.push(new TestStructure('2', 'hello1'));
      firstArray.push(new TestStructure('3', 'hello2'));

      secondArray.push(new TestStructure('1', 'hello1'));
      secondArray.push(new TestStructure('2', 'hello1'));
      secondArray.push(new TestStructure('4', 'hello2'));

      comparisonResult = compareArrays(firstArray, secondArray, (_first, _second) => {
        return _first.key === _second.key;
      });
      expect(comparisonResult).toEqual(-2);
    });
  });

  describe('getArrayCount()', () => {
    it(`should return the array records count`, () => {
      let listItems: TestStructure[] = new Array();

      listItems.push(new TestStructure('1', 'hello1'));
      listItems.push(new TestStructure('2', 'hello1'));
      listItems.push(new TestStructure('3', 'hello2'));

      expect(getArrayCount(listItems)).toEqual(3);
    });

    it(`should return 0 when the array is undefined`, () => {
      let listItems: TestStructure[];
      expect(getArrayCount(listItems)).toBe(0);
    });
  });

  describe('isArray()', () => {
    it(`should return true when supplied object is an array`, () => {
      let listItems: TestStructure[] = new Array();

      listItems.push(new TestStructure('1', 'hello1'));
      listItems.push(new TestStructure('2', 'hello1'));
      listItems.push(new TestStructure('3', 'hello2'));

      expect(isArray(listItems)).toBeTruthy();
    });

    it(`should return false when supplied object is not an array`, () => {
      let listItems: TestStructure;
      expect(isArray(listItems)).toBeFalsy();
    });
  });
});
