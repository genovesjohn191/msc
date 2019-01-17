import { EventEmitter } from '@angular/core';

export interface Paginator {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  pageChangedStream: EventEmitter<any>;
  reset(): void;
  showLoading(showLoading: boolean): void;
}
