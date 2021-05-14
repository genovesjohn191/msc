import {
  of,
  Observable
} from 'rxjs';
import {
  finalize,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  CoreRoutes,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents,
  McsTableSelection2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsQueryParam,
  McsStateNotification,
  McsTerraformDeployment,
  McsTerraformDeploymentCreateActivity,
  RouteKey,
  TerraformDeploymentActivityType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-azure-deployments',
  templateUrl: './azure-deployments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentsComponent implements OnDestroy {

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
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService2,
    private _translateService: TranslateService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this.dataSource = new McsTableDataSource2(this._getDeployments.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeTerraformDeployments,
      dataClearEvent: McsEvent.dataClearTerraformDeployments
    });
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

  public onClickDestroy(): void {
    // TODO(apascual): As of now based on specs, we won't be supporting multiple destroy of deployment
    // but soon as part of the improvement we need to support that. In that case, remove this checking
    if (!this.dataSelection?.hasSingleSelection()) { return; }

    let deployment = this.dataSelection.getSelectedItems()[0];
    let dialogRef = this._dialogService.openMatchConfirmation({
      type: DialogActionType.Warning,
      valueToMatch: deployment.name,
      placeholder: this._translateService.instant('dialog.terraformDeploymentDestroy.placeholder'),
      title: this._translateService.instant('dialog.terraformDeploymentDestroy.title'),
      message: this._translateService.instant('dialog.terraformDeploymentDestroy.message', {
        name: deployment.name
      }),
      width: '30rem',
      confirmText: this._translateService.instant('action.destroy'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      switchMap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm || !result?.data) { return of(null); }

        let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
          confirm: true,
          type: TerraformDeploymentActivityType.Destroy,
          clientReferenceObject: {
            terraformDeploymentId: deployment.id,
            terraformActivityRefId: Guid.newGuid().toString(),
            type: TerraformDeploymentActivityType.Plan
          }
        });
        return this._apiService.createTerraformDeploymentActivity(deployment.id, requestPayload);
      }),
      finalize(() => this.dataSelection.clearAllSelection())
    ).subscribe();
  }

  public onClickDelete(deployment: McsTerraformDeployment): void {
    if (isNullOrEmpty(deployment)) { return; }

    let dialogRef = this._dialogService.openMatchConfirmation({
      type: DialogActionType.Warning,
      valueToMatch: deployment.name,
      placeholder: this._translateService.instant('dialog.terraformDeploymentDelete.placeholder'),
      title: this._translateService.instant('dialog.terraformDeploymentDelete.title'),
      message: this._translateService.instant('dialog.terraformDeploymentDelete.message', {
        name: deployment.name,
        deploymentUrl: `${CoreRoutes.getNavigationPath(RouteKey.LaunchPadAzureDeployments)}/${deployment.id}`
      }),
      width: '30rem',
      confirmText: this._translateService.instant('action.delete'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      switchMap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm || !result?.data) { return of(null); }
        return this._apiService.deleteTerraformDeployment(deployment.id).pipe(
          tap(() =>
            this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
              new McsStateNotification('success', 'message.successfullyDeleted',)
            )
          )
        );
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
