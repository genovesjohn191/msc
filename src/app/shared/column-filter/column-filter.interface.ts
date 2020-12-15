import { BehaviorSubject } from 'rxjs';

import { McsFilterInfo } from '@app/models';

export interface ColumnFilter {
  filters: McsFilterInfo[];
  filterPredicate: (filter: McsFilterInfo) => boolean;
  filtersChange: BehaviorSubject<McsFilterInfo[]>;
}
