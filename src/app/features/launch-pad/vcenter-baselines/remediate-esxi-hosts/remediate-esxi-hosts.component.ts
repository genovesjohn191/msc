import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throwError,
  BehaviorSubject,
  Observable,
  Subscription
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  McsJobEvents,
  McsPageBase
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  DataStatus,
  McsJob,
  McsOption,
  McsOptionGroup,
  McsVCenterBaseline,
  McsVCenterHost,
  McsVCenterHostQueryParam
} from '@app/models';
import {
  deleteArrayRecord,
  getSafeFormValue,
  isNullOrEmpty,
  isNullOrUndefined,
  refreshView,
  unsubscribeSafely,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';

import { RemediateEsxiHostsViewModel } from './remediate-esxi-hosts.viewmodel';
export interface OptionDisablingData {
  isDisabled: boolean;
  helptext: string
}

@Component({
  selector: 'mcs-vcenter-remediate-esxi-hosts',
  templateUrl: './remediate-esxi-hosts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VCenterRemediateEsxiHostsComponent extends McsPageBase implements OnInit, OnDestroy {
  public readonly jobEvents: McsJobEvents;
  public readonly viewModel: RemediateEsxiHostsViewModel;
  public readonly treeDatasource: TreeDatasource<McsOptionGroup>;

  public companyId$: Observable<string>;
  public vcenterName$: Observable<string>;
  public activeBaselineIds$: Observable<string[]>;
  public activeHostIds$: Observable<string[]>;

  private _remediateHandler: Subscription;
  private _hostGroupChange = new BehaviorSubject<McsOptionGroup[]>(null);
  private _baselineOptionsChange = new BehaviorSubject<McsOption[]>(null);
  private _vcenterOptionsChange = new BehaviorSubject<McsOption[]>(null);
  private _dataCentreOptionsChange = new BehaviorSubject<McsOption[]>(null);
  private _activeBaselineIdsChange = new BehaviorSubject<string[]>(null);
  private _activeHostIdsChange = new BehaviorSubject<string[]>(null);

  public constructor(injector: Injector) {
    super(injector);
    this.jobEvents = new McsJobEvents(injector);
    this.viewModel = new RemediateEsxiHostsViewModel(injector);
    this.treeDatasource = new TreeDatasource<McsOptionGroup>(this._convertServerGroupToTreeItems.bind(this));
  }

  public get featureName(): string {
    return 'vcenter-remediate-esxi-hosts';
  }

  public get showHostsSelection(): boolean {
    return !isNullOrEmpty(this.viewModel?.fcCompany?.value) ||
      (!isNullOrEmpty(this.viewModel?.fcVCenter?.value) &&
      !isNullOrEmpty(this.viewModel?.fcDatacentre?.value));
  }

  public ngOnInit(): void {
    this._registerEventHandlers();

    this._subscribeToActiveBaselines();
    this._subscribeToActiveHosts();
    this._subscribeToCompanyChange();
    this._subscribeToVCenterChange();
    this._subscribeToHostGroups();
    this._subscribeToQueryParams();
  }

  public ngOnDestroy(): void {
    this.dispose();
    unsubscribeSafely(this._remediateHandler);
  }

  public onClickRemediate(): void {
    if (!this.viewModel.validate()) { return; }

    this.jobEvents.setStatus(DataStatus.Active);
    let apiModel = this.viewModel.generateApiModel();
    this.apiService.remediateBaseline(this.viewModel.baselineId, apiModel).pipe(
      tap(job => {
        this.jobEvents.setJobs(job).setStatus(DataStatus.Success);
        this.showSuccessfulMessage('message.remediateInitiated');
      }),
      catchError(error => {
        this.jobEvents.setStatus(DataStatus.Error);
        this.showSuccessfulMessage('message.commandFailed');
        return throwError(() => error);
      })
    ).subscribe();
  }

  public onBaselineOptionsChange(options: McsOption[]): void {
    this._baselineOptionsChange.next(options ?? []);
  }

  public onVCenterOptionsChange(options: McsOption[]): void {
    this._vcenterOptionsChange.next(options);
  }

  public onDataCentreOptionsChange(options: McsOption[]): void {
    this._dataCentreOptionsChange.next(options);
  }

  private _subscribeToCompanyChange(): void {
    this.companyId$ = this.viewModel.fcCompany.valueChanges.pipe(
      takeUntil(this.destroySubject),
      distinctUntilChanged(),
      debounceTime(500),
      shareReplay(1)
    );
  }

  private _subscribeToVCenterChange(): void {
    this.vcenterName$ = this.viewModel.fcVCenter.valueChanges.pipe(
      takeUntil(this.destroySubject),
      distinctUntilChanged(),
      debounceTime(500),
      map(vcenterId => {
        let vcenterFound = (this._vcenterOptionsChange.getValue() || [])
          .find(option => option.data.id === vcenterId);
        return vcenterFound?.data?.name;
      }),
      shareReplay(1)
    );
  }

  private _subscribeToActiveBaselines(): void {
    this.activeBaselineIds$ = this._activeBaselineIdsChange.pipe(
      takeUntil(this.destroySubject),
      shareReplay(1)
    );
  }

  private _subscribeToActiveHosts(): void {
    this.activeHostIds$ = this._activeHostIdsChange.pipe(
      takeUntil(this.destroySubject),
      shareReplay(1)
    );
  }

  private _subscribeToHostGroups(): void {
    merge(
      this.viewModel.fcCompany.valueChanges,
      this.viewModel.fcVCenter.valueChanges,
      this.viewModel.fcDatacentre.valueChanges
    ).pipe(
      startWith(null),
      takeUntil(this.destroySubject),
      debounceTime(500),
      switchMap(() => {
        let query = new McsVCenterHostQueryParam();

        let dataCentreId = getSafeFormValue<string>(this.viewModel.fcDatacentre);
        if (dataCentreId) {
          let dataCentreFound = (this._dataCentreOptionsChange.getValue() || [])
            .find(option => option.data.id === dataCentreId);
          query.dataCentre = dataCentreFound?.text || null;
        }

        let companyId = getSafeFormValue<string>(this.viewModel.fcCompany);
        if (companyId) {
          let optionalHeaders = new Map<string, string>();
          optionalHeaders.set('Company-id', companyId);
          query.optionalHeaders = optionalHeaders;
        }

        return this.apiService.getVCenterHosts(query).pipe(
          map(response => response?.collection)
        );
      }),
      tap(hosts => {
        let groupRecords = new Array<McsOptionGroup>();
        hosts?.forEach(host => {

          // Do the grouping per option item
          let groupName = host.parentCluster?.name || 'Others';
          let optionItem = new McsOption(
            host.id,
            host.managementName,
            this.translate.instant('message.hostNotCompliant'),
            false,
            host,
            `${host.serviceId} - ${host.managementIpAddress}`
          );

          let foundGroup = groupRecords.find(group => group.groupName === groupName);
          if (foundGroup) {
            foundGroup.options.push(optionItem);
            return;
          }

          let newOptions = new Array<McsOption>();
          newOptions.push(optionItem);
          groupRecords.push(new McsOptionGroup(groupName, ...newOptions));
        });

        this._hostGroupChange.next(groupRecords);
      })
    ).subscribe();
  }

  private _convertServerGroupToTreeItems(): Observable<TreeItem<string>[]> {
    return this._hostGroupChange.pipe(
      map(groups =>
        TreeUtility.convertEntityToTreemItems(groups,
          group => new TreeGroup(group.groupName, group.groupName, group.options, {
            selectable: true,
            excludeFromSelection: true,
            disableWhen: (data) => this._disableClusterFunc(group.options)
          }),
          option => new TreeGroup(option.text, option.value, null, {
            selectable: !option.disabled,
            subscript: option.subscript,
            disableWhen: (dataId) => this._disableHostFunc(dataId)?.isDisabled,
            tooltipFunc: (dataId) => this._disableHostFunc(dataId)?.helptext,
          })
        )
      )
    );
  }

  private _disableHostFunc(hostId: string): OptionDisablingData {
    let activeHostIds = this._activeHostIdsChange.getValue() || [];
    if (activeHostIds.includes(hostId)) {
      return {
        isDisabled: true,
        helptext: this.translate.instant('message.remediateHostInProgress')
      } as OptionDisablingData;
    }

    let data: OptionDisablingData = {
      isDisabled: false,
      helptext: null
    };

    let baselineId = getSafeFormValue<string>(this.viewModel.fcBaseline);
    if (isNullOrUndefined(baselineId)) { return data; }

    let baselines = this._baselineOptionsChange.getValue()?.map(b => b.data) ?? [];
    let baselineFound = (baselines as Array<McsVCenterBaseline>).find(baseline => baseline.id === baselineId);

    if (isNullOrEmpty(baselineFound)) { return data; }

    // Check if host is not in the baseline complianceset
    let hostCannotBeRemediate = baselineFound.complianceSet
      ?.filter(cs => cs.status === 'Compliant')
      ?.find(cs => cs.host === hostId);

    return !isNullOrEmpty(hostCannotBeRemediate) ? {
      isDisabled: true,
      helptext: this.translate.instant('message.hostNotCompliant')
    } as OptionDisablingData : data;
  }

  private _disableClusterFunc(options: McsOption[]): boolean {
    let rawHosts = options?.map(option => option.data);
    if (isNullOrEmpty(rawHosts)) { return false; }

    let hosts = rawHosts as Array<McsVCenterHost>;
    let hasEnabledItem = false;

    for (const host of hosts) {
      hasEnabledItem = !this._disableHostFunc(host.id)?.isDisabled;
      if (hasEnabledItem) {
        break;
      }
    }
    return !hasEnabledItem;
  }

  private _subscribeToQueryParams(): void {
    this.activatedRoute.queryParamMap.pipe(
      takeUntil(this.destroySubject),
      tap(queryParamMap => {
        let baselineId = queryParamMap.get('baselineId');
        if (isNullOrEmpty(baselineId)) { return; }
        this._getBaselineDetails(baselineId);
      })
    ).subscribe();
  }

  private _getBaselineDetails(id: string): void {
    if (isNullOrEmpty(id)) { return; }

    this.apiService.getVCenterBaseline(id).pipe(
      tap(response => {
        if (!response?.approved) {
          this.showErrorMessage('message.unapprovedBaseline');
          return;
        }

        refreshView(() => {
          this.viewModel.updateViewModel(response);
        })
      })
    ).subscribe();
  }

  private _registerEventHandlers(): void {
    this._remediateHandler = this.eventDispatcher.addEventListener(
      McsEvent.jobVCenterBaselineRemediate, this._onSetRemediateFlag.bind(this)
    );

    // Invoke the event initially
    this.eventDispatcher.dispatch(McsEvent.jobVCenterBaselineRemediate);
  }

  private _onSetRemediateFlag(job: McsJob): void {
    let hostIds = job?.clientReferenceObject?.hostIds;
    let activeHostIds = this._activeHostIdsChange.getValue() || [];

    if (isNullOrEmpty(hostIds)) { return; }

    hostIds.forEach((hostId) => {
      if(job.inProgress){
        if(!activeHostIds.includes(hostId)) activeHostIds.push(hostId);
      }
      else {
        deleteArrayRecord(activeHostIds, existingId => existingId === hostId);
      }
    });
    this._activeHostIdsChange.next(activeHostIds);
  }
}
