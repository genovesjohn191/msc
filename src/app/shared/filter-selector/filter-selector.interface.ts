import { EventEmitter } from '@angular/core';
import { McsFilterInfo } from '@app/models';

export interface FilterSelector {
  key: string;
  filterItemsMap: Map<string, McsFilterInfo>;
  filtersChange: EventEmitter<Map<string, McsFilterInfo>>;
  removeFilterSelector(key: string): void;
  addFilterSelector(key: string): void;
  onFilterChange(): void;
}
