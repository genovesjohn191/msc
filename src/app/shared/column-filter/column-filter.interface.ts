import { BehaviorSubject } from 'rxjs';

import { McsFilterInfo } from '@app/models';

export interface ColumnFilter {
  filters: McsFilterInfo[];
  filtersChange: BehaviorSubject<McsFilterInfo[]>;
}
