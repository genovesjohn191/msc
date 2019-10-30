import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { IMcsDataChange } from '@app/core';
import { McsFilterInfo } from '@app/models';

@Component({
  selector: 'mcs-column-filter',
  templateUrl: './column-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'column-filter-wrapper'
  }
})

export class ColumnFilterComponent implements IMcsDataChange<McsFilterInfo[]> {
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
