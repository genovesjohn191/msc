import {
      Pipe,
      PipeTransform
    } from '@angular/core';
  import { isNullOrEmpty, isNullOrUndefined } from '@app/utilities';
    
  // Definition
  const DEFAULT_KEY: string = null;
    @Pipe({
      name: 'mcsArrayHasElement'
    })
    
    export class ArrayHasElement implements PipeTransform {
      /**
       * Checks the given array data if it has elements
       * @param data Data to be transformed
       * @param key (optional) name of a child array object that will be included on the element checking
       */
      public transform(data: Array<any>, key: string = DEFAULT_KEY): boolean {
        return (this._traverseArrayElements(data, key));
      }
      private _traverseArrayElements(data: Array<any>, key: string): boolean {
        let result: boolean = false;
          if(!isNullOrEmpty(key)){
            let pluckedObject = data.map(obj=> obj[key]);
            let pluckedChildArray = (Array.isArray(pluckedObject)) ? pluckedObject : null;
             result = (!isNullOrEmpty(data) && !isNullOrEmpty(pluckedChildArray));
          }
          else{
            result = (!isNullOrEmpty(data));
          }
        
        return result; 
      }
    }
    
  