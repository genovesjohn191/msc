import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';
import {
  McsMatTableContext,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsReportInefficientVmParams,
  McsReportInefficientVms
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

  private _sortDirection: string;
  private _sortField: string;

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

  constructor(private _reportingService: McsReportingService) {
    this._initializePeriod();
    this.dataSource = new McsTableDataSource2(this._getInefficientVms.bind(this));
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onSortChange(sortState: Sort) {
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _getInefficientVms(): Observable<McsMatTableContext<McsReportInefficientVms>> {
    this.dataChange.emit(undefined);

    let queryParam = new McsReportInefficientVmParams();
    queryParam.period = this._period;
    queryParam.subscriptionIds = !isNullOrEmpty(this.subscriptionIds) ? this.subscriptionIds.join(): '';
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

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
