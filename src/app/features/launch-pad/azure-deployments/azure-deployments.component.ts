import {
  of,
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { Sort } from '@angular/material/sort';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  CoreRoutes,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents,
  McsTableSelection2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DynamicFormFieldConfigBase,
  DynamicFormFieldDataChangeEventParam,
  DynamicSelectChipsCompanyField
} from '@app/features-shared/dynamic-form';
import {
  McsAzureDeploymentsQueryParams,
  McsFilterInfo,
  McsJob,
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
  unsubscribeSafely,
  Guid
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

class AzureDeleteData {
  constructor(
    public message: string,
    public includeDestroy: boolean) { }
}

@Component({
  selector: 'mcs-azure-deployments',
  templateUrl: './azure-deployments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentsComponent extends McsPageBase implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsTerraformDeployment>;
  public readonly dataSelection: McsTableSelection2<McsTerraformDeployment>;
  public readonly dataEvents: McsTableEvents<McsTerraformDeployment>;

  @ViewChild('deleteDeploymentTemplate', { read: TemplateRef })
  public deleteDeploymentTemplate: TemplateRef<any>;

  private _routerHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _companyId: string;
  private _sortDirection: string;
  private _sortField: string;

  public formConfig$: Observable<DynamicFormFieldConfigBase[]>;
  public isSorting: boolean;

  public readonly defaultColumnFilters = [
    // createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' }),
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
    private _apiService: McsApiService,
    private _activatedRoute: ActivatedRoute
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getDeployments.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeTerraformDeployments,
      dataClearEvent: McsEvent.dataClearTerraformDeployments
    });

    this._subscribeToQueryParams();
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._routerHandler);
  }

  public get featureName(): string {
    return 'azure-deployments';
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

    let deleteData = new AzureDeleteData(
      this._translateService.instant('dialog.terraformDeploymentDelete.message', {
        name: deployment.name,
        deploymentUrl: `${CoreRoutes.getNavigationPath(RouteKey.LaunchPadAzureDeployments)}/${deployment.id}`
      }),
      false
    );

    let dialogRef = this._dialogService.openMatchConfirmation({
      type: DialogActionType.Warning,
      valueToMatch: deployment.name,
      placeholder: this._translateService.instant('dialog.terraformDeploymentDelete.placeholder'),
      title: this._translateService.instant('dialog.terraformDeploymentDelete.title'),
      message: this.deleteDeploymentTemplate,
      data: deleteData,
      width: '30rem',
      confirmText: this._translateService.instant('action.delete'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      switchMap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm || !result?.data) { return of(null); }

        if (!deleteData.includeDestroy) {
          return this._runDelete(deployment);
        }

        return this._runDestroyAndDelete(deployment);
      })
    ).subscribe();
  }

  public navigateToDeployment(deployment: McsTerraformDeployment): void {
    if (isNullOrEmpty(deployment) || deployment.isDisabled) { return; }
    this._navigationService.navigateTo(RouteKey.LaunchPadAzureDeploymentDetails, [deployment.id]);
  }

  public getModuleType(projectKey: string) {
    switch (projectKey) {
      case ('TSM'): {
        return 'Azure Solution'
      }

      case ('TRM'): {
        return 'Azure Resource'
      }

      default: {
        return 'Customer Specific'
      }
    }
  }

  public formBeforeDataChanged(params: DynamicFormFieldDataChangeEventParam): void {
    if (isNullOrEmpty(params)) {
      return;
    }

    switch (params.eventName) {
      case 'company-change':
        if (!isNullOrEmpty(params.value)) {
          this._navigationService.navigateTo(
            RouteKey.LaunchPadAzureDeployments, [], {
            queryParams: {
              companyId: params.value
            }
          });
        }
        else {
          this._navigationService.navigateTo(RouteKey.LaunchPadAzureDeployments);
        }
        break;
    }
  }

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  private _subscribeToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      map((params) => getSafeProperty(params, (obj) => obj.companyId)),
      tap(id => {
        this._companyId = id;
        this.formConfig$ = of([
          new DynamicSelectChipsCompanyField({
            key: 'company',
            label: 'Company',
            value: [{
              value: id,
              label: id
            }],
            placeholder: 'Search for company name or ID...',
            allowCustomInput: false,
            maxItems: 1,
            eventName: 'company-change',
          })
        ]);
        this.retryDatasource();
      })
    ).subscribe();
  }

  private _getDeployments(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsTerraformDeployment>> {
    let queryParam = new McsAzureDeploymentsQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.companyId = this._companyId;
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;

    return this._apiService.getTerraformDeployments(queryParam).pipe(
      catchError((error) => {
        this.isSorting = false;
        return throwError(error);
      }),
      map(response => {
        this.isSorting = false;
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount);
      }));
  }

  private _runDelete(deployment: McsTerraformDeployment): Observable<boolean> {
    return this._apiService.deleteTerraformDeployment(deployment.id).pipe(
      tap(() =>
        this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
          new McsStateNotification('success', 'message.successfullyDeleted',)
        )
      )
    );
  }

  private _runDestroyAndDelete(deployment: McsTerraformDeployment): Observable<McsJob> {
    let requestPayload = createObject(McsTerraformDeploymentCreateActivity, {
      confirm: true,
      deleteDeployment: true,
      type: TerraformDeploymentActivityType.Destroy,
      clientReferenceObject: {
        terraformDeploymentId: deployment.id,
        terraformActivityRefId: Guid.newGuid().toString(),
        type: TerraformDeploymentActivityType.Destroy
      }
    });
    return this._apiService.createTerraformDeploymentActivity(deployment.id, requestPayload);
  }
}
