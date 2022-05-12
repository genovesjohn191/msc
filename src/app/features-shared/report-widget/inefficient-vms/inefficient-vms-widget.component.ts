import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableContext,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsReportInefficientVms,
  McsReportInefficientVmParams
} from '@app/models';
import {
  compareArrays,
  createObject,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-inefficient-vms-widget',
  templateUrl: './inefficient-vms-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class InefficientVmsWidgetComponent {

  public readonly dataSource: McsTableDataSource2<McsReportInefficientVms>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'vmName' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'efficiencyIndex' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'size' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'utilizationThisMonth' }),
  ];

  @Input()
  public set subscriptionIds(value: string[]) {
    let subscriptionId = !isNullOrEmpty(value) ? value : [];
    let comparisonResult = compareArrays(subscriptionId, this._subscriptionIds);
    if (comparisonResult === 0) { return; }

    this._subscriptionIds = value;
    this.retryDatasource();
  }

  @Output()
  public dataChange= new EventEmitter<McsReportInefficientVms[]>(null);

  private _subscriptionIds: string[] = undefined;
  private _period: string = '';
  private _sortDef: MatSort;

  constructor(private _reportingService: McsReportingService) {
    this._initializePeriod();
    this.dataSource = new McsTableDataSource2(this._getInefficientVms.bind(this));
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
      this._sortDef = value;
    }
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getInefficientVms(): Observable<McsMatTableContext<McsReportInefficientVms>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsReportInefficientVmParams();
    queryParam.period = this._period;
    queryParam.subscriptionIds = !isNullOrEmpty(this.subscriptionIds) ? this.subscriptionIds.join(): '';
    queryParam.sortDirection = this._sortDef?.direction;
    queryParam.sortField = this._sortDef?.active;

    return this._reportingService.getInefficientVms(queryParam).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }

  private _initializePeriod(): void {
    let currentMonth = new Date(new Date().setMonth(new Date().getMonth()));
    this._period = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
  }
}
