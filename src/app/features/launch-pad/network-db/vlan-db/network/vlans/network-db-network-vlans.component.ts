import {
  forkJoin,
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil,
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
import { FormControl } from '@angular/forms';
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { FieldSelectTreeViewComponent } from '@app/features-shared';
import {
  FlatOption,
  GroupedOption
} from '@app/features-shared/dynamic-form';
import {
  networkDbVniStatusText,
  DataStatus,
  McsFilterInfo,
  McsJob,
  McsNetworkDbMazAaQueryParams,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkQueryParams,
  McsNetworkDbNetworkReserve,
  McsNetworkDbPod,
  McsNetworkDbVlan,
  McsNetworkDbVlanAction,
  NetworkDbVniStatus,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  DialogActionType,
  DialogService2
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  refreshView,
  unsubscribeSafely,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility,
  compareStrings
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { NetworkDbNetworkDetailsService } from '../network-db-network.service';

@Component({
  selector: 'mcs-network-db-network-vlans',
  templateUrl: './network-db-network-vlans.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkVlansComponent implements OnInit, OnDestroy {

  public network$: Observable<McsNetworkDbNetwork>;
  public vlans: McsNetworkDbVlan[];
  public watchedJobs = new Array();
  public watchedReservationJob: McsJob;
  public isMazAa: boolean = false;
  public initialAssignedPodIds = new Array();
  private multicastIpAddressId: string = undefined

  public processing: boolean = false;
  public processingReservation: boolean = false;
  public hasError: boolean = false;
  public hasReservationError: boolean = false;
  public reservationDisabled: boolean = false;
  public reservationLoading: boolean = false;

  public readonly dataSource: McsTableDataSource2<McsNetworkDbVlan>;
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'number' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'site' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'pod' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'action' })
  ];

  public treeFormControl = new FormControl('', []);
  public treeDatasource: TreeDatasource<GroupedOption>;
  private podList = new Array<McsNetworkDbPod>();
  private vxlanGroup: number = null;
  private selectedPods: number[] = [];

  private _jobEventHandler: Subscription;
  private _destroySubject = new Subject<void>();
  private _dialogSubject = new Subject<void>();

  private _toBeConvertedItemsChange = new BehaviorSubject<GroupedOption[]>(null);
  private _updatedFlatOptionsChange = new BehaviorSubject<FlatOption[]>(null);

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
    this.treeDatasource = new TreeDatasource<GroupedOption>(this._convertFamiliesToTreeItems.bind(this));
    this._subscribeToNetworkDetails();
    this._watchNetworkDbChanges();
    this._subscribeToPodTreeViewChanges();
    this._getInitialMulticastIpAddress();
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  @ViewChild('treeViewSelect')
  public treeViewSelect: FieldSelectTreeViewComponent<any>;

  private _subscribeToNetworkDetails(): void {
    this.network$ = this._networkDetailService.getNetworkDetails().pipe(
      takeUntil(this._destroySubject),
      shareReplay(1),
    );
  }

  public ngOnInit(): void {
    this._getInitialPodOptions().subscribe(records => {
      this._toBeConvertedItemsChange.next(records);
    });
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._jobEventHandler);
    unsubscribeSafely(this._dialogSubject);
  }

  private _subscribeToPodTreeViewChanges(): void {
    this.treeFormControl.valueChanges.pipe(
      takeUntil(this._destroySubject),
    ).subscribe(change => {
      this._onPodTreeViewChange(change);
    });
  }

  private _onPodTreeViewChange(selectedPods: number[]): void {
    this.selectedPods = selectedPods;
    if (!isNullOrEmpty(selectedPods)) {
      this._filterPodOptions();
    }
    else {
      this._updatedFlatOptionsChange.next(null);

      if (isNullOrEmpty(this._toBeConvertedItemsChange.getValue())) { return; }
      if (isNullOrEmpty(this.initialAssignedPodIds)) { this.vxlanGroup = null }

      this._getInitialPodOptions().subscribe(records => {
        this._toBeConvertedItemsChange.next(records);
      });
    }
  }

  private _getInitialPodOptions(): Observable<GroupedOption[]> {
    let groupedOptions: GroupedOption[] = [];

    return this._apiService.getNetworkDbPods().pipe(
      map((response) => {
        this.podList = response.collection;
        this.initialAssignedPodIds = this.vlans.map(vlan => vlan.podId);
        if (!isNullOrEmpty(this.initialAssignedPodIds)) {
          let assignedPod = response.collection.find(p => p.id === this.initialAssignedPodIds[0]);
          this.vxlanGroup = assignedPod.vxLanGroup;
          this._checkVxLanGroupIdMismatch();
        }

        response.collection.sort((a, b) => compareStrings(a.siteName, b.siteName))
          .forEach((item) => {
            let groupName = item.siteName;
            let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
            let option = {
              key: item.id,
              value: item.name,
              disabled: item.freeVlans === 0 || this._exluded(item)
            } as FlatOption;

            if (item.freeVlans === 0) {
              option.hint = this._translateService.instant('networkDb.vlans.reserveHints.noFreeVlans');
            }

            if (this._exluded(item)) {
              option.hint = option.hint ? option.hint + ' '
                + this._translateService.instant('networkDb.vlans.reserveHints.alreadyAssigned')
                : this._translateService.instant('networkDb.vlans.reserveHints.alreadyAssigned');
            }

            if (!(isNullOrUndefined(this.vxlanGroup) || item.vxLanGroup === this.vxlanGroup)) {
              option.disabled = true;
              option.hint = option.hint ? option.hint + ' '
                + this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch')
                : this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch');
            }

            if (existingGroup) {
              // Add option to existing gdroup
              existingGroup.options.push(option);
            } else {
              // Add option to new group
              groupedOptions.push({
                type: 'group',
                name: groupName,
                options: [option]
              });
            }
          });

        let updatedOptions = new Array<FlatOption>();

        groupedOptions?.forEach(groupOptions => {
          let filteredOptions = groupOptions.options.filter(option => option.disabled);
          if (isNullOrEmpty(filteredOptions)) { return; }
          updatedOptions.push(...filteredOptions);
        });

        this._updatedFlatOptionsChange.next(updatedOptions);
        this.treeViewSelect?.updateView();
        return groupedOptions;
      }));
  }

  private _filterPodOptions(): void {
    let query: McsNetworkDbMazAaQueryParams = {
      podIds: this.selectedPods,
      keyword: 'pod_ids'
    }
    let updatedOptionsObservable = this._updateOptionsByVxLanGroup(this.selectedPods);
    let mazAaAvailablePodsObservable = this._apiService.getMazAaAvailablePods(query);
    let groupOptionsObservable = updatedOptionsObservable;
    if (this.isMazAa) {
      this.reservationLoading = true;
      groupOptionsObservable = forkJoin([updatedOptionsObservable, mazAaAvailablePodsObservable]).pipe(
        map(results => {
          let updatedOptions = results[0];
          let mazAaAvailablePods = results[1]?.availablePods;

          updatedOptions.forEach(group => {
            group.options.forEach(opt => {
              const hintText = this._translateService.instant('networkDb.vlans.reserveHints.mazAaNotAvailable');
              if (!mazAaAvailablePods?.includes(opt.key) && !this.selectedPods.includes(opt.key) && !opt.hint?.includes(hintText)) {
                opt.disabled = true;
                opt.hint = opt.hint ? opt.hint + ' ' + hintText : hintText;
              }
            });
          });
          return updatedOptions;
        })
      );
    }

    groupOptionsObservable.pipe(
      tap(groupedOptions => {
        let updatedOptions = new Array<FlatOption>();

        groupedOptions?.forEach(groupOptions => {
          let filteredOptions = groupOptions.options.filter(option => option.disabled);
          if (isNullOrEmpty(filteredOptions)) { return; }
          updatedOptions.push(...filteredOptions);
        });

        this._updatedFlatOptionsChange.next(updatedOptions);
        this.treeViewSelect?.updateView();
        this.reservationLoading = false;
      })
    ).subscribe();
  }

  private _updateOptionsByVxLanGroup(selectedPods: number[]): Observable<GroupedOption[]> {
    if (isNullOrEmpty(this.vxlanGroup)) {
      const selectedPod = this.podList?.filter(item => item.id === selectedPods[0])[0];
      this.vxlanGroup = selectedPod?.vxLanGroup;
    }

    let options = this._toBeConvertedItemsChange.getValue();
    options.forEach(group => {
      group.options.forEach(opt => {
        const hintText = this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch');
        const pod = this.podList?.filter(item => item.id === opt.key)[0];
        if (pod?.vxLanGroup !== this.vxlanGroup && !opt.hint?.includes(hintText)) {
          opt.disabled = true;
          opt.hint = opt.hint ? opt.hint + ' ' + hintText : hintText;
        }
      });
    });
    return of(options);
  }

  private _convertFamiliesToTreeItems(): Observable<TreeItem<string>[]> {
    return this._toBeConvertedItemsChange.pipe(
      map(records =>
        TreeUtility.convertEntityToTreemItems(records,
          record => new TreeGroup(record.name, record.name, record.options),
          child => new TreeGroup(child.value, child.key, null, {
            selectable: true,
            disableWhen: this._isOptionDisabled.bind(this),
            tooltipFunc: this._getOptionTooltip.bind(this)
          })
        )
      )
    );
  }

  private _isOptionDisabled(itemKey: any): boolean {
    let updatedOptions = this._updatedFlatOptionsChange.getValue() || [];
    let optionFound = updatedOptions?.find(option => option.key === itemKey);
    return optionFound?.disabled;
  }

  private _getOptionTooltip(itemKey: any): string {
    let updatedOptions = this._updatedFlatOptionsChange.getValue() || [];
    let optionFound = updatedOptions?.find(option => option.key === itemKey);
    return optionFound?.hint;
  }

  //
  // Excludes pods that are already assigned to vlans
  //
  private _exluded(item: McsNetworkDbPod): boolean {
    if (!isNullOrEmpty(this.initialAssignedPodIds)) {
      let podId = this.initialAssignedPodIds.filter(b => b === item.id);
      if (!isNullOrEmpty(podId)) {
        return true;
      }
    }
    return false;
  }

  private _showMulticastIpAddressChangedDialog(): void {
    this._dialogService.openMessage({
      type: DialogActionType.Info,
      title: this._translateService.instant('networkDb.multicastIpAddressChangedDialog.title'),
      message: this._translateService.instant('networkDb.multicastIpAddressChangedDialog.message'),
      okText: this._translateService.instant('action.dismiss')
    });
  }

  //
  // This handles the edge case wherein the
  // initially assigned pods have different Vxlan groups
  //
  private _checkVxLanGroupIdMismatch(): void {
    let pods = this.podList?.filter(({ id }) => this.initialAssignedPodIds.includes(id));
    let vxLanGroupIds = pods.map(pod => pod.vxLanGroup);

    if (!isNullOrEmpty(vxLanGroupIds) || vxLanGroupIds.length > 1) {
      let unique = [...new Set(vxLanGroupIds)];
      if (isNullOrEmpty(unique) || unique.length > 1) {
        this.reservationDisabled = true;
      }
    }
  }

  public get isValidPayload(): boolean {

    if (isNullOrEmpty(this.treeFormControl.value)) { return false; }

    if (this.isMazAa) {
      return this.treeFormControl.value.length >= 2;
    }
    else {
      return this.treeFormControl.value.length >= 1;
    }
  }

  private _formatPayload(): McsNetworkDbNetworkReserve {
    if (isNullOrEmpty(this.treeFormControl.value)) { return }

    return createObject(McsNetworkDbNetworkReserve, {
      clientReferenceObject: {
        networkId: this._networkDetailService.getNetworkDetailsId()
      },
      pods: this.treeFormControl.value,
      isMazaa: this.isMazAa
    });
  }

  public retry(): void {
    this.hasReservationError = false;
    this.processingReservation = false;
    this._changeDetector.markForCheck();
  }

  public reserveVlanClicked(id: number): void {
    this.processingReservation = true;
    const requestPayload = this._formatPayload();

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
    this._reset();
  }

  public getPodSelectLabel(): string {
    return this.isMazAa ? this._translateService.instant('networkDb.pods.labelSelectMazAa')
      : this._translateService.instant('networkDb.pods.labelSelect');
  }

  private _reset(): void {
    refreshView(() => {
      this.treeFormControl.reset();
    });
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

  private _getTableData(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNetworkDbVlan>> {
    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);

    return this._networkDetailService.getNetworkVlans().pipe(
      map(response => {
        this.vlans = response;
        return new McsMatTableContext(response)
      })
    );
  }

  private _getInitialMulticastIpAddress(): void {
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
      this._refreshObjectDetails();
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
      this._refreshObjectDetails();
      this._reset();
    }
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }

  private _refreshObjectDetails(): void {
    let id = this._networkDetailService.getNetworkDetailsId();
    this._apiService.getNetworkDbNetwork(id).pipe(
      map((network) => {
        if (isNullOrEmpty(network)) { return; }
        if (this.multicastIpAddressId !== network.multicastIpAddressId) {
          this._showMulticastIpAddressChangedDialog();
          this.multicastIpAddressId = network.multicastIpAddressId;
        }
        this._networkDetailService.setNetworkDetails(network);
        this.retryDatasource();
      }
      )).subscribe();
  }
}