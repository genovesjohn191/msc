import {
    Pipe,
    PipeTransform
  } from '@angular/core';
  
  @Pipe({
    name: 'mcsArrayHasElement'
  })
  /*TODO:
  refactor pipe - include option to check specific array element and include it on the element checking logic as well
  */
  export class ArrayHasElement implements PipeTransform {
    /**
     * Checks the given array data if it has elements
     * @param data Data to be transformed
     */
    public transform(data: Array<any>): boolean {
      return (data) ? data.length > 0 : false;
    }
  }
  