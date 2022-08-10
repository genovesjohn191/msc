import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throwError,
  BehaviorSubject,
  Observable
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
import {
  DataStatus,
  McsOption,
  McsOptionGroup,
  McsVCenterBaseline,
  McsVCenterHost
} from '@app/models';
import {
  getSafeFormValue,
  isNullOrEmpty,
  isNullOrUndefined,
  refreshView,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';

import { RemediateEsxiHostsViewModel } from './remediate-esxi-hosts.viewmodel';

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

  private _hostGroupChange = new BehaviorSubject<McsOptionGroup[]>(null);
  private _baselineOptionsChange = new BehaviorSubject<McsOption[]>(null);
  private _vcenterOptionsChange = new BehaviorSubject<McsOption[]>(null);

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
      !isNullOrEmpty(this.viewModel?.fcVCenter?.value);
  }

  public ngOnInit(): void {
    this._subscribeToCompanyChange();
    this._subscribeToVCenterChange();
    this._subscribeToHostGroups();
    this._subscribeToQueryParams();
  }

  public ngOnDestroy(): void {
    this.dispose();
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
      }),
    ).subscribe();
  }

  public onBaselineOptionsChange(options: McsOption[]): void {
    this._baselineOptionsChange.next(options ?? []);
  }

  public onVCenterOptionsChange(options: McsOption[]): void {
    this._vcenterOptionsChange.next(options);
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

  private _subscribeToHostGroups(): void {
    this.viewModel.fcCompany.valueChanges.pipe(
      startWith(null),
      takeUntil(this.destroySubject),
      debounceTime(500),
      switchMap(companyId => {
        let optionalHeaders = new Map<string, string>();
        if (companyId) {
          optionalHeaders.set('Company-id', companyId);
        }

        return this.apiService.getVCenterHosts(optionalHeaders).pipe(
          map(response => response?.collection)
        );
      }),
      tap(hosts => {
        let groupRecords = new Array<McsOptionGroup>();
        hosts?.forEach(host => {
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
            selectable: false,
            excludeFromSelection: false,
            disableWhen: () => this._disableClusterFunc(group.options)
          }),
          option => new TreeGroup(option.text, option.value, null, {
            selectable: !option.disabled,
            subscript: option.subscript,
            disableWhen: this._disableHostFunc.bind(this),
            tooltipFunc: (data) => this._disableHostFunc(data) ? null : option.helpText
          })
        )
      )
    );
  }

  private _disableHostFunc(data: McsVCenterHost): boolean {
    let baselineId = getSafeFormValue<string>(this.viewModel.fcBaseline);
    if (isNullOrUndefined(baselineId)) { return false; }

    let baselines = this._baselineOptionsChange.getValue()?.map(b => b.data) ?? [];
    let baselineFound = (baselines as Array<McsVCenterBaseline>).find(baseline => baseline.id === baselineId);
    if (isNullOrEmpty(baselineFound)) { return false; }

    // TODO: Check this out, is the complianceset host is the id? or the name
    let hostFound = baselineFound.complianceSet
      ?.filter(cs => cs.status === 'Compliant')
      ?.find(cs => cs.host === data.id);
    return !isNullOrEmpty(hostFound);
  }

  private _disableClusterFunc(options: McsOption[]): boolean {
    let rawHosts = options?.map(option => option.data);
    if (isNullOrEmpty(rawHosts)) { return false; }

    let hosts = rawHosts as Array<McsVCenterHost>;
    let hasEnabledItem = false;

    for (const host of hosts) {
      hasEnabledItem = !this._disableHostFunc(host);
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
        refreshView(() => {
          this.viewModel.updateViewModel(response);
        })
      })
    ).subscribe();
  }
}
