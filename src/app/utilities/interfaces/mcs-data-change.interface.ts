import { EventEmitter } from '@angular/core';

export interface McsDataChange<T> {
  dataChange: EventEmitter<T>;
  notifyDataChange(): void;
}
