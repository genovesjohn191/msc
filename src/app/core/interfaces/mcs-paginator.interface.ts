import { EventEmitter } from '@angular/core';

export interface McsPaginator {
  /**
   * A zero(0) base index that is dynamically updated based on the
   * current page of the paginator
   */
  pageIndex: number;

  /**
   * Item per page of the paginator
   */
  pageSize: number;

  /**
   * Count of all the items currently displayed
   */
  displayedItemsCount: number;

  /**
   * Total record length handled by the paginator
   */
  length: number;

  /**
   * Loading flag that show the spinner on the paginator
   *
   * `@Note` Change this flag according to obtainment data
   */
  loading: boolean;

  /**
   * Event that emit the changes when page is changed
   */
  pageStream: EventEmitter<any>;
}
