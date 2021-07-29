import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CoreRoutes,
  McsAuthenticationIdentity,
  McsMatTableConfig,
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import { WorkflowSelectorConfig } from '@app/features/launch-pad/workflows/workflow';
import {
  CrispOrderState,
  McsFilterInfo,
  McsObjectProjectsQueryParams,
  McsObjectProjectTasks,
  ProductType,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { createObject } from '@app/utilities';
import { DashboardProjectService } from '../dashboard-project.service';

@Component({
  selector: 'mcs-dashboard-project-tasks',
  templateUrl: './dashboard-project-tasks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProjectTasksComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsObjectProjectTasks>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'orderId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'productType' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'shortDescription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'assignedTo' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' })
  ];

  public state: CrispOrderState = 'OPEN';

  public constructor(
    private _apiService: McsApiService,
    private _dashboardProjectService: DashboardProjectService,
    private _identity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2<McsObjectProjectTasks>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public reloadProjectTasks(state: CrispOrderState): void {
    this.state = state;
    this.retryDatasource();
  }

  public navigateToCrispOrder(task: McsObjectProjectTasks, keyRoute: RouteKey): void {
    this._navigationService.navigateTo(RouteKey.LaunchPadCrispOrderDetails,
      [task.orderId.toString(), CoreRoutes.getNavigationPath(keyRoute)]
    );
  }

  public getLauncherConfig(record: McsObjectProjectTasks):  WorkflowSelectorConfig {
    let productType: any = ProductType[record.productType];

    return {
      label: record.serviceId,
      companyId: this._identity.user.companyId,
      source: 'crisp-elements',
      serviceId: record.serviceId,
      productId: record.productId.toString(),
      type: productType
    };
  }

  private _getTableData(): Observable<McsMatTableContext<McsObjectProjectTasks>> {
    let queryParam = new McsObjectProjectsQueryParams();
    queryParam.pageIndex = 1;
    queryParam.pageSize = 100;
    queryParam.state = this.state;

    return this._apiService.getProjectTasks(this._dashboardProjectService.getDashboardProjectId().toString(), queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount)));
  }
}