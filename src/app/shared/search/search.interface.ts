import { Subject } from 'rxjs';

export interface Search {
  /**
   * This will give the keyword to be searched
   */
  keyword: string;

  /**
   * Event that emit the changes when search is changed within the time bound
   */
  searchChangedStream: Subject<any>;

  /**
   * Returns true when user is currently searching, otherwise false
   */
  searching: boolean;

  /**
   * Show or hide the loader of search component
   */
  showLoading(showLoading: boolean): void;
}
