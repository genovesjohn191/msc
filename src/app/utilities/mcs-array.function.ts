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
  return mergedArray;
}

/**
 * Update array record based on the updated element, if the element is
 * already exist the value on the array will be updated otherwise
 * the updated element will be appended as the last record of the array
 * @param sourceArray Record list for the updatedElement to be append to
 * @param updatedElement Updated element to check if the record is already exist
 * @param predicate Rules of matching the element
 */
export function updateArrayRecord<T>(
  sourceArray: T[],
  updatedElement: T,
  predicate?: (_pr1: T, _pr2: T) => boolean): T[] {

  let isExist: boolean = false;

  // Initialize for undefined and null record
  if (!sourceArray) { sourceArray = new Array(); }

  // Update the existing element else append to last record
  if (predicate) {

    for (let index = 0; index < sourceArray.length; index++) {
      if (predicate(sourceArray[index], updatedElement)) {
        isExist = true;
        sourceArray[index] = updatedElement;
        break;
      }
    }
    if (!isExist) {
      sourceArray.push(updatedElement);
    }
  } else {

    sourceArray.push(updatedElement);
  }

  return sourceArray;
}
