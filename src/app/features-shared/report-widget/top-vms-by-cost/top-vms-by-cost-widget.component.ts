import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation
} from '@angular/core';
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
  McsQueryParam,
  McsReportTopVmsByCost
} from '@app/models';
import {
  CommonDefinition,
  createObject
} from '@app/utilities';

const maxTopVmsToDisplay: number = 5;

@Component({
  selector: 'mcs-top-vms-by-cost-widget',
  templateUrl: './top-vms-by-cost-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class TopVmsByCostWidgetComponent {

  public readonly dataSource: McsTableDataSource2<McsReportTopVmsByCost>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  @Output()
  public dataChange= new EventEmitter<McsReportTopVmsByCost[]>(null);

  constructor(private _reportingService: McsReportingService) {
    this.dataSource = new McsTableDataSource2(this._getTopVmsByCost.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'vmName' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'totalCost' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'totalHours' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'reservedHours' }),
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public get azureUsageCloudHealthUrl(): string  {
    return `${CommonDefinition.CLOUD_HEALTH_URL}/reports/azure_usage/arm_vm_hours`;
  }

  private _getTopVmsByCost(): Observable<McsMatTableContext<McsReportTopVmsByCost>> {
    let queryParam = new McsQueryParam();
    queryParam.pageSize = maxTopVmsToDisplay;

    return this._reportingService.getTopVmsByCost(queryParam).pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext?.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }

}
