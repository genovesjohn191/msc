import { EventEmitter } from '@angular/core';

export interface IMcsDataChange<T> {
  dataChange: EventEmitter<T>;
  notifyDataChange(): void;
}
