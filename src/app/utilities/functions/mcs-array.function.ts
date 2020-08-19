import {
  isNullOrEmpty,
  updateObjectData
} from './mcs-object.function';

/**
 * Merge 2 arrays according to predicate definition,
 * if predicate is supplied the second array will merge to the first array
 * according to predicate, otherwise the second array will just appended to the first array
 * @param firstArray First Array Record (Old Record for comparison)
 * @param secondArray Second Array Record (This must be updated)
 * @param predicate Rules on how to conduct the merging
 *
 * `@Note`: This will return the instance of the previous record
 */
export function mergeArrays<T>(
  firstArray: T[],
  secondArray: T[],
  predicate?: (_pr1: T, _pr2: T) => boolean): T[] {

  let mergedArray: T[] = new Array();

  // Initialize for undefined and null record
  if (!firstArray) { firstArray = new Array(); }
  if (!secondArray) { secondArray = new Array(); }

  if (predicate) {
    // Update all element of the first array based on the predicate (i:e by ID)
    firstArray.forEach((firstElement) => {
      let updatedElement: T = firstElement;
      for (let secondElement of secondArray) {
        if (predicate(firstElement, secondElement)) {
          updateObjectData(updatedElement, secondElement);
          break;
        }
      }
      mergedArray.push(updatedElement);
    });

    // Append all new second element record to the merged array
    secondArray.forEach((secondElement) => {
      let isExist = mergedArray.find((mergedElement) => {
        return predicate(mergedElement, secondElement);
      });
      if (!isExist) { mergedArray.push(secondElement); }
    });
  } else {
    // Merge all array without predicate
    mergedArray = firstArray.concat(secondArray);
  }

  // Set merged record array to firstarray instance
  return mergedArray;
}

/**
 * Update array record based on the updated element, if the element is
 * already exist the value on the array will be updated otherwise
 * the updated element will be appended as the last record of the array
 * @param sourceArray Record list for the updatedElement to be append to
 * @param record Updated element to check if the record is already exist
 * @param updateOnly `@Optional` flag if the record should be appended in the array
 * @param compareFn Rules of matching the element
 * @param insertIndex `@Optional` Custom index to insert the record
 */
export function addOrUpdateArrayRecord<T>(
  sourceArray: T[],
  record: T,
  updateOnly: boolean,
  compareFn?: (_record: T) => boolean,
  insertIndex?: number): T[] {

  let isExisting: boolean = false;
  let recordIndex: number = 0;
  let insertThisItem: boolean = !updateOnly;

  // Initialize for undefined and null record
  if (!sourceArray) { sourceArray = new Array(); }

  // Update the existing element else append to last record
  recordIndex = isNullOrEmpty(compareFn) ? sourceArray.indexOf(record) :
    sourceArray.findIndex((sourceRecord) => compareFn(sourceRecord));
  isExisting = recordIndex >= 0;
  if (isExisting) {
    updateObjectData(sourceArray[recordIndex], record);
    return sourceArray;
  }

  // Insert item based on index
  if (insertThisItem) {
    let validIndex = insertIndex !== undefined && insertIndex >= 0;
    validIndex
      ? sourceArray.splice(insertIndex, 0, record)
      : sourceArray.push(record);
  }
  return sourceArray;
}

/**
 * Delete the specific record in the array list based on predicate
 * @param sourceArray Source of the array list
 * @param itemCount Item count to be deleted in the source array list
 * @param predicate Rules of matching the element
 */
export function deleteArrayRecord<T>(
  sourceArray: T[],
  predicate: (_predicate: T) => boolean,
  itemCount: number = -1): T[] {

  // Initialize for undefined and null record
  if (!sourceArray) { sourceArray = new Array(); }
  let instancesToDelete: T[] = new Array();

  sourceArray.forEach((_item) => {
    if (predicate(_item)) {
      // Target count of the item to be deleted
      let targetCount = itemCount > 0 && instancesToDelete.length >= itemCount;
      if (targetCount) { return; }

      instancesToDelete.push(_item);
    }
  });

  instancesToDelete.forEach((instance) => {
    sourceArray.splice(sourceArray.indexOf(instance), 1);
  });

  return sourceArray;
}

/**
 * Clear the values and reference of the array records
 * @param source Array source to be cleared
 */
export function clearArrayRecord<T>(source: T[]): void {
  // Clears out the array reference and values
  for (let i = source.length; i > 0; i--) {
    source.pop();
  }
}

/**
 * Compare 2 array record based on predicate definition
 * 1 = First array is greater than second array
 * 0 = Both arrays are the same
 * -1 = Second array is greater than first array
 * -2 = Array records are not the same
 * @param firstArray First Array to be compared
 * @param secondArray Second Array to be compared
 * @param predicate Predicate definition to be use as comparison,
 * default comparison method will be use when this predicate is not given.
 */
export function compareArrays<T>(
  firstArray: T[],
  secondArray: T[],
  predicate?: (_p1: T, _p2: T) => boolean): number {
  let contentType: number = 0;

  // Initialize for undefined and null record
  if (!firstArray) { firstArray = new Array(); }
  if (!secondArray) { secondArray = new Array(); }

  // Set the default comparer when the predicate is not provided
  if (!predicate) {
    predicate = (_rec1, _rec2) => JSON.stringify(_rec1) === JSON.stringify(_rec2);
  }

  // Check record count
  if (firstArray.length > secondArray.length) { return contentType = -1; }
  if (secondArray.length > firstArray.length) { return contentType = 1; }

  // Check record content
  for (let index = 0; index < firstArray.length; index++) {
    if (!predicate(firstArray[index], secondArray[index])) {
      contentType = -2;
      break;
    }
  }
  return contentType;
}

/**
 * Returns the array count. If the array is undefined, it will return 0
 * @param sourceArray Array source to get the count
 */
export function getArrayCount<T>(sourceArray: T[]): number {
  return !sourceArray ? 0 : sourceArray.length;
}

/**
 * Returns all the unique records from the array
 * @param sourceArray Source array to get the unique from
 * @param predicate Predicate definition that evaluates the unique items
 */
export function getUniqueRecords<T>(sourceArray: T[], predicate: (item: T) => any): T[] {
  if (isNullOrEmpty(sourceArray)) { return; }

  let uniqueItems = new Set(sourceArray.map((predicate)));
  return Array.from(uniqueItems).map((id) =>
    sourceArray.find((item) => predicate(item) === id)
  );
}

/**
 * Move a record inside an array into the specified index using a combination of splices
 * @param sourceArray Source array to move the record from
 * @param sourceIndex the index of the record to be move
 * @param destinationIndex the expected destination index of the record after moving
 */
export function moveRecordByIndex<T>(sourceArray: T[], sourceIndex: number, destinationIndex: number): void {
  if (isNullOrEmpty(sourceArray)) { return; }

  let removedRecord = sourceArray.splice(sourceIndex, 1)[0];
  sourceArray.splice(destinationIndex, 0, removedRecord);
}

/**
 * Returns true when the representation object is an array, otherwise false
 * @param object Object to be checked
 */
export function isArray(object: any): boolean {
  return Object.prototype.toString.call(object) === '[object Array]';
}

/**
 * Returns an array of values plucked from the properties of source array object
 * @param sourceArray list of objects
 * @param propertyName name of the property to be plucked
 */
export function pluck(sourceArray: any[], propertyName: string): Array<any> {
  if (isArray(sourceArray) && propertyName) {
    let pluckedObject = sourceArray.map(obj => obj[propertyName]);
    return pluckedObject;
  }
}
