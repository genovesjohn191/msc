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
   * Total record count handled by the paginator
   */
  totalCount: number;

  /**
   * Event that emit the changes when page is changed
   */
  pageChangedStream: EventEmitter<any>;

  /**
   * Call this method when the paging is completed
   */
  pageCompleted(): void;
}
