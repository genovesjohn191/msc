import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsFilterInfo } from '@app/models';

import { ColumnFilter } from './column-filter.interface';

@Component({
  selector: 'mcs-column-filter',
  templateUrl: './column-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'column-filter-wrapper'
  }
})

export class ColumnFilterComponent implements ColumnFilter {
  @Input()
  public filters: McsFilterInfo[];

  @Output()
  public dataChange = new EventEmitter<McsFilterInfo[]>();

  /**
   * Notifies the data change
   */
  public notifyDataChange(): void {
    this.dataChange.next(this.filters);
  }
}
