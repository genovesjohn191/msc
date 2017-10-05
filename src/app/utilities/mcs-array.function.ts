/**
 * Merge 2 arrays according to predicate definition,
 * if predicate is supplied the second array will merge to the first array
 * according to predicate, otherwise the second array will just appended to the first array
 * @param firstArray First Array Record (Old Record for comparison)
 * @param secondArray Second Array Record (This must be updated)
 * @param predicate Rules on how to conduct the merging
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
          updatedElement = secondElement;
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
 * @param predicate Rules of matching the element
 * @param insertIndex `@Optional` Custom index to insert the record
 */
export function addOrUpdateArrayRecord<T>(
  sourceArray: T[],
  record: T,
  updateOnly: boolean,
  predicate?: (_pr1: T, _pr2: T) => boolean,
  insertIndex?: number): T[] {

  let isExisting: boolean = false;
  let insertThisItem: boolean = !updateOnly;

  // Initialize for undefined and null record
  if (!sourceArray) { sourceArray = new Array(); }

  // Update the existing element else append to last record
  if (predicate) {

    for (let index = 0; index < sourceArray.length; index++) {
      if (predicate(sourceArray[index], record)) {
        isExisting = true;
        sourceArray[index] = record;
        break;
      }
    }
    insertThisItem = insertThisItem && !isExisting;
  }

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
  itemCount: number = 1): T[] {

  // Initialize for undefined and null record
  if (!sourceArray) { sourceArray = new Array(); }
  let indexes: number[] = new Array();

  for (let index = 0; index < sourceArray.length; index++) {
    if (predicate(sourceArray[index])) {
      indexes.push(index);
      if (indexes.length >= itemCount) { break; }
    }
  }
  indexes.forEach((index) => {
    sourceArray.splice(index, 1);
  });

  return sourceArray;
}
