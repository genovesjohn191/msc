import { EventEmitter } from '@angular/core';

export interface McsSearch {
  /**
   * This will give the keyword to be searched
   */
  keyword: string;

  /**
   * Event that emit the changes when search is changed within the time bound
   */
  searchChangedStream: EventEmitter<any>;
}
