import {
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil
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
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import {
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  licenseStatusText,
  LicenseStatus,
  McsFilterInfo,
  McsJob,
  McsLicense,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  addDaysToDate,
  compareDates,
  createObject,
  getCurrentDate,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { LicenseService } from './licenses.service';

@Component({
  selector: 'mcs-licenses',
  templateUrl: './licenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicensesComponent extends McsPageBase implements OnInit, OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsLicense>;
  public readonly dataEvents: McsTableEvents<McsLicense>;
  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'quantity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'unit' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'status' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'commitmentStartDate' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'commitmentEndDate' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'autoRenewal' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'offerId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'subscriptionId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'billingFrequency' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'term' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'parent' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public activeJobs$: Observable<McsJob[]>;
  public licenses$: Observable<McsLicense[]>;
  private _destroySubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _licenseService: LicenseService,
    private _navigationService: McsNavigationService,
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getLicenses.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeLicenses
    });
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get featureName(): string {
    return 'licenses';
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get ellipsisIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get unfoldMoreIcon(): string {
    return CommonDefinition.ASSETS_SVG_UNFOLD_MORE_BLACK;
  }

  public get hasPermissionToCreateOrder(): boolean {
    return this._accessControlService.hasPermission(['OrderEdit']);
  }

  public ngOnInit(): void {
    this._subscribeToLicenseChange();
    this._subscribeToLicensesResolver();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to ordering license count change
   */
  public onChangeLicenseCount(license: McsLicense): void {
    this._eventDispatcher.dispatch(McsEvent.licenseCountChangeSelectedEvent, license);
    this._navigationService.navigateTo(RouteKey.OrderMsLicenseCountChange);
  }

  /**
   * Navigate to microsoft service request change
   */
  public onChangeLicenseService(license: McsLicense): void {
    this._eventDispatcher.dispatch(McsEvent.serviceRequestChangeSelectedEvent, license);
    this._navigationService.navigateTo(RouteKey.OrderMsRequestChange);
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsLicense): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }

  /**
   * Returns true if the selected license is suspended, pending or trial license,
   * Also check its parent if it has similar status
   */
  public isLicenseDisabled(licenses: McsLicense[], currentLicense: McsLicense): boolean {
    if (isNullOrEmpty(currentLicense)) { return true; }
    if (isNullOrEmpty(currentLicense.parentServiceId)) { return !currentLicense.isChangeable; }

    let parentLicense = licenses.find((license) => license.serviceId === currentLicense.parentServiceId);
    if (isNullOrEmpty(parentLicense)) { return true; }

    return !parentLicense.isChangeable || !currentLicense.isChangeable;
  }

  private _subscribeToLicensesResolver(): void {
    this.licenses$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.licenses))
    );
  }

  /**
   * Returns true if current license has no running job
   */
  public isCurrentLicenseHasNoActiveJob(currentLicense: McsLicense, activeJobs: McsJob[]): boolean {
    let hasActiveJob = activeJobs.find((job) => job?.clientReferenceObject?.serviceId === currentLicense.serviceId);
    if (isNullOrEmpty(hasActiveJob)) {
      return true;
    }
  }

  /**
   * Returns true if 1 or more active licenses without running jobs attached
   */
  public isLicensesActiveAndNoRunningJobs(licenses: McsLicense[], activeJobs: McsJob[]): boolean {
    let activeLicenses = this.getAllActiveLicenses(licenses);
    if (!activeLicenses) {
      return;
    }

    if (activeJobs) {
      let licenseWithNoActiveJob: McsLicense[] = [];
      activeLicenses.forEach((license) => {
        activeJobs.forEach((job) => {
          if (job.clientReferenceObject.serviceId !== license.serviceId) {
            licenseWithNoActiveJob.push(license);
          }
        });
      });
      if (licenseWithNoActiveJob.length >= 1) {
        this._changeDetectorRef.markForCheck();
        return true;
      }
    }

    if (activeLicenses.length > 0 && activeJobs.length === 0) {
      this._changeDetectorRef.markForCheck();
      return true;
    }
  }

  /**
   * Returns true if license is expiring within 7 days
   */
  public isLicenseExpiring(license: McsLicense): boolean {
    return (license.commercialAgreementType?.toUpperCase() === 'NCE'
      && compareDates(license.commitmentEndDate, addDaysToDate(getCurrentDate(), 7)) < 1
      && compareDates(license.commitmentEndDate, getCurrentDate()) === 1
      && !license.autoRenewEnabled);
  }

  /**
   * Returns all licenses that has an active status and service Id
   */
  private getAllActiveLicenses(licenses: McsLicense[]): McsLicense[] {
    if (isNullOrEmpty(licenses)) { return; }
    let licenseActiveWithServiceId: McsLicense[] = [];
    licenseActiveWithServiceId = licenses.filter((license) => !isNullOrEmpty(license.serviceId) &&
      license.statusLabel === licenseStatusText[LicenseStatus.Active]);
    return licenseActiveWithServiceId;
  }

  /**
   * Subscribe to license count changes
   */
  private _subscribeToLicenseChange(): void {
    this.activeJobs$ = this._licenseService.licenseJobsChange().pipe(
      takeUntil(this._destroySubject),
      map((licenseJobs) => licenseJobs.filter((job) => job.inProgress)),
      shareReplay(1)
    )
  }

  private _getLicenses(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsLicense>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getLicenses(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'offerId') {
      return this._accessControlService.hasPermission(['CompanyView']);
    }
    return true;
  }
}
