import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';

import {
  DataStatus,
  McsFilterInfo,
  McsJob,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkQueryParams,
  McsNetworkDbNetworkReserve,
  McsNetworkDbVlan,
  McsNetworkDbVlanAction,
  NetworkDbVniStatus,
  networkDbVniStatusText,
  RouteKey
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { NetworkDbNetworkDetailsService } from '../network-db-network.service';
import {
  ColumnFilter,
  DialogActionType,
  DialogService2
} from '@app/shared';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  DynamicFormComponent,
  DynamicFormFieldConfigBase,
  DynamicSelectMultipleNetworkDbPodsField
} from '@app/features-shared/dynamic-form';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-network-db-network-vlans',
  templateUrl: './network-db-network-vlans.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkVlansComponent implements OnDestroy {

  public network$: Observable<McsNetworkDbNetwork>;
  public vlans: McsNetworkDbVlan[];
  public watchedJobs = new Array();
  public watchedReservationJob: McsJob;
  public isMazAa: boolean = false;
  public assignedPodIds = new Array();
  private multicastIpAddressId: string = undefined

  public processing: boolean = false;
  public processingReservation: boolean = false;
  public hasError: boolean = false;
  public hasReservationError: boolean = false;
  public reservationDisabled: boolean = false;

  public readonly dataSource: McsTableDataSource2<McsNetworkDbVlan>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'number' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'site' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'pod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
  ];

  private _jobEventHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _dialogSubject = new Subject<void>();

  public formConfig: DynamicFormFieldConfigBase[] = [
    new DynamicSelectMultipleNetworkDbPodsField({
      key: 'pods',
      label: 'Select one or more pods',
      isMazAa: this.isMazAa
    })
  ];

  public constructor(
    _injector: Injector,
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService,
    private _dialogService: DialogService2,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.dataSource = new McsTableDataSource2<McsNetworkDbVlan>(this._getTableData.bind(this))
      .registerConfiguration(new McsMatTableConfig(true))
      .registerColumnsFilterInfo(this.defaultColumnFilters);
    this._subscribeToNetworkDetails();
    this._watchNetworkDbChanges();
    this.getInitialMulticastIpAddress();
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  @ViewChild('form')
  public form: DynamicFormComponent;

  private _subscribeToNetworkDetails(): void {
    this.network$ = this._networkDetailService.getNetworkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1),
    );
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._jobEventHandler);
    unsubscribeSafely(this._dialogSubject);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getStatusText(status: NetworkDbVniStatus): string {
    return networkDbVniStatusText[status];
  }

  public recycleClicked(id: number): void {
    this.processing = true;
    let requestPayload = createObject(McsNetworkDbVlanAction, {
      clientReferenceObject: {
        vlanId: id.toString()
      }
    });

    this._changeDetector.markForCheck();
    this._apiService.recycleNetworkVlan(id.toString(), requestPayload).pipe(
      map(response => {
        this._watchThisJob(response);
      })
    ).subscribe();
  }

  public reclaimClicked(id: number): void {
    this.processing = true;
    let requestPayload = createObject(McsNetworkDbVlanAction, {
      clientReferenceObject: {
        vlanId: id.toString()
      }
    });

    this._changeDetector.markForCheck();
    this._apiService.reclaimNetworkVlan(id.toString(), requestPayload).pipe(
      map(response => {
        this._watchThisJob(response);
      })
    ).subscribe();
  }

  public reserveVlanClicked(id: number): void {
    this.processingReservation = true;
    const requestPayload = this.formatPayload();

    this._changeDetector.markForCheck();
    this._apiService.reserveNetworkVlan(this._networkDetailService.getNetworkDetailsId(), requestPayload).pipe(
      catchError(() => {
        this.hasReservationError = true;
        this.processingReservation = false;
        this._changeDetector.markForCheck();

        return throwError('Network creation endpoint failed.');
      }),
      map(response => {
        this._watchThisJob(response, true);
      })
    ).subscribe();
  }

  public getNotificationRoute(): any[] {
    return [RouteKey.Notification, this.watchedReservationJob.id];
  }

  public toggleMazAa(): void {
    this.isMazAa = !this.isMazAa;
    this.clearForm();
  }

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbVlan>> {
    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);

    return this._networkDetailService.getNetworkVlans().pipe(
      map(response => {
        this.vlans = response;
        this.setExcludedPods();
        return new McsMatTableContext(response)
      })
    );
  }

  private getInitialMulticastIpAddress(): void {
    this._networkDetailService.getNetworkDetails().pipe(
      map(network => {
        this.multicastIpAddressId = network.multicastIpAddressId;
      })
    ).subscribe();
  }

  private _watchThisJob(job: McsJob, isReserveJob: boolean = false): void {
    this.watchedJobs.push(job);

    if (isReserveJob) {
      this._jobEventHandler = this._eventDispatcher.addEventListener(
        McsEvent.jobReceive, this._onReserveJobUpdatesReceived.bind(this));
      return;
    }

    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onVlanJobUpdatesReceived.bind(this));
  }

  private _onVlanJobUpdatesReceived(job: McsJob): void {

    let watchedJob = this.watchedJobs.find(item => item.id === job.id);
    if (isNullOrEmpty(watchedJob)) { return; }

    // Failed
    if (job.dataStatus === DataStatus.Error) {
      this.hasError = true;
      this.processing = false;
      this._changeDetector.markForCheck();
      return;
    }

    // Successful
    if (job.dataStatus === DataStatus.Success) {
      this.hasError = false;
      this.processing = false;

      this._changeDetector.markForCheck();
      this.refreshObjectDetails();
    }
  }

  private _onReserveJobUpdatesReceived(job: McsJob): void {
    let watchedJob = this.watchedJobs.find(item => item.id === job.id);
    if (isNullOrEmpty(watchedJob)) { return; }

    this.watchedReservationJob = job;

    // Failed
    if (job.dataStatus === DataStatus.Error) {
      this.hasReservationError = true;
      this.processingReservation = false;
      this._changeDetector.markForCheck();

      return;
    }

    // Successful
    if (job.dataStatus === DataStatus.Success) {
      this.hasReservationError = false;
      this.processingReservation = false;

      this._changeDetector.markForCheck();
      this.refreshObjectDetails();
      this.clearForm();
    }
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }

  private refreshObjectDetails(): void {
    let id = this._networkDetailService.getNetworkDetailsId();
    this._apiService.getNetworkDbNetwork(id).pipe(
      map((network) => {
        if (isNullOrEmpty(network)) { return; }
        if(this.multicastIpAddressId !== network.multicastIpAddressId) {
          this.showMulticastIpAddressChangedDialog();
          this.multicastIpAddressId = network.multicastIpAddressId;
        }
        this._networkDetailService.setNetworkDetails(network);
        this.retryDatasource();
      }
      )).subscribe();
  }

  private showMulticastIpAddressChangedDialog(): void{
    this._dialogService.openMessage({
      type: DialogActionType.Info,
      title: this._translateService.instant('networkDb.multicastIpAddressChangedDialog.title'),
      message: this._translateService.instant('networkDb.multicastIpAddressChangedDialog.message'),
      okText: this._translateService.instant('action.dismiss')
    });
  }

  private setExcludedPods(): void {
    this.assignedPodIds = this.vlans.map(vlan => vlan.podId);
    this.formConfig = [
      new DynamicSelectMultipleNetworkDbPodsField({
        key: 'pods',
        label: 'Select one or more pods',
        value: [],
        excludePods: this.assignedPodIds,
        isMazAa: this.isMazAa
      })];

    this.checkVxLanGroupIdMismatch();
  }

  private checkVxLanGroupIdMismatch(): void {
    this._apiService.getNetworkDbPods().pipe(
      map(response => {
        let pods = response.collection?.filter(({id}) => this.assignedPodIds.includes(id));
        let vxLanGroupIds = pods.map(pod => pod.vxLanGroup);

        if (!isNullOrEmpty(vxLanGroupIds) || vxLanGroupIds.length > 1) {
          let unique = [...new Set(vxLanGroupIds)];
          if (isNullOrEmpty(unique) || unique.length > 1) {
            this.reservationDisabled = true;
          }
        }
      })).subscribe();
  }

  private clearForm(): void {
    this.formConfig = [
      new DynamicSelectMultipleNetworkDbPodsField({
        key: 'pods',
        label: 'Select one or more pods',
        value: [],
        excludePods: this.assignedPodIds,
        isMazAa: this.isMazAa
      })];
    this.form.resetForm();
  }

  public get isValidPayload(): boolean {

    if (isNullOrEmpty(this.form)) { return false; }

    let properties = this.form.getRawValue();
    if (this.isMazAa) {
      return properties.pods.length >= 2;
    }
    else {
      return properties.pods.length >= 1;
    }
  }

  private formatPayload(): McsNetworkDbNetworkReserve {
    if (isNullOrEmpty(this.form)) { return }

    const properties = this.form.getRawValue();
    const podIds = properties.pods?.map(pod => pod.key);

    return createObject(McsNetworkDbNetworkReserve, {
      clientReferenceObject: {
        networkId: this._networkDetailService.getNetworkDetailsId()
      },
      pods: podIds,
      isMazaa: this.isMazAa
    });
  }

  public retry(): void {
    this.hasReservationError = false;
    this.processingReservation = false;
    this._changeDetector.markForCheck();
  }
}