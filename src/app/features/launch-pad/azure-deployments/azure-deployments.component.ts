import { Observable } from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents,
  McsTableSelection2
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsQueryParam,
  McsTerraformDeployment,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  DialogResult,
  DialogResultAction,
  DialogService2,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-azure-deployments',
  templateUrl: './azure-deployments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentsComponent implements OnInit, OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsTerraformDeployment>;
  public readonly dataSelection: McsTableSelection2<McsTerraformDeployment>;
  public readonly dataEvents: McsTableEvents<McsTerraformDeployment>;

  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'deployment' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'tenant' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'moduleType' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'module' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'version' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'lastUpdated' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _dialogService: DialogService2
  ) {
    this.dataSource = new McsTableDataSource2(this._getDeployments.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeTerraformDeployments,
      dataClearEvent: McsEvent.dataClearTerraformDeployments
    });

    // TODO(apascual):
    // 1. There are some items in the table that are not in API response (status, subscription, moduletype).
    // 2. Add Data Activation Class, and change the isProcessing, and statusLabel content on HTML. Should be implemented in deletion.
    // 3. Status in McsTerraformDeployment model should be set based on actual field name.
    // 4. Check if we still need the events from terraform deployments, or the data activation class can do the work.
  }

  public ngOnInit() {
    // this._setResourcesFlag();
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public toggleAllDeploymentsSelection() {
    if (isNullOrEmpty(this.dataSelection)) { return; }
    this.dataSelection.toggleAllItemsSelection((deployment) => !deployment.isProcessing);
  }

  public allDeploymentsAreSelected() {
    if (isNullOrEmpty(this.dataSelection)) { return false; }
    return this.dataSelection.allItemsAreSelected((deployment) => !deployment.isProcessing);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public onClickNewDeployment() {
    this._navigationService.navigateTo(RouteKey.LaunchPadAzureDeploymentCreate);
  }

  public onClickDelete(deployment: McsTerraformDeployment): void {
    if (isNullOrEmpty(deployment)) { return; }

    let dialogRef = this._dialogService.openNameConfirmation({
      name: deployment.name,
      placeholder: this._translateService.instant('dialog.terraformDeploymentDelete.placeholder'),
      title: this._translateService.instant('dialog.terraformDeploymentDelete.title'),
      message: this._translateService.instant('dialog.terraformDeploymentDelete.message', {
        deploymentUrl: `${CoreRoutes.getNavigationPath(RouteKey.LaunchPadAzureDeployments)}/${deployment.id}`
      }),
      confirmText: this._translateService.instant('action.yes'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm || !result?.data) { return; }
        this._apiService.deleteTerraformDeployment(deployment.id).subscribe();
      })
    ).subscribe();
  }

  public navigateToDeployment(deployment: McsTerraformDeployment): void {
    if (isNullOrEmpty(deployment) || deployment.isDisabled) { return; }
    this._navigationService.navigateTo(RouteKey.LaunchPadAzureDeploymentDetails, [deployment.id]);
  }

  private _getDeployments(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTerraformDeployment>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getTerraformDeployments(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection, response?.totalCollectionCount))
    );
  }
}
