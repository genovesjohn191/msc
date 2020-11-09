import { EventEmitter } from '@angular/core';
import { McsFilterInfo } from '@app/models';

export interface ColumnFilter {
  filters: McsFilterInfo[];
  dataChange: EventEmitter<McsFilterInfo[]>;
}
