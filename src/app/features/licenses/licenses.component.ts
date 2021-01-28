import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  McsTableListingBase,
  IMcsColumnManager,
  McsAccessControlService,
  McsNavigationService
} from '@app/core';
import {
  McsLicense,
  McsApiCollection,
  McsQueryParam,
  McsFilterInfo,
  RouteKey,
  LicenseStatus,
  licenseStatusText,
  McsJob
} from '@app/models';
import {
  getSafeProperty,
  CommonDefinition,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import { LicenseService } from './licenses.service';

@Component({
  selector: 'mcs-licenses',
  templateUrl: './licenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicensesComponent extends McsTableListingBase<McsLicense> implements OnInit, OnDestroy, IMcsColumnManager {
  public activeJobs$: Observable<McsJob[]>;
  public licenses$: Observable<McsLicense[]>;
  private _destroySubject = new Subject<void>();

  private _columnPermissionMatrix = new Map<string, () => boolean>();

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _activatedRoute: ActivatedRoute,
    private _accessControlService: McsAccessControlService,
    private _licenseService: LicenseService
  ) {
    super(_injector, _changeDetectorRef);
  }

  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_LICENSE_LISTING;
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

  public ngOnInit(): void {
    this._subscribeToLicenseChange();
    this._subscribeToLicensesResolver();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    this.dispose();
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
   * Returns true when the column is included in the display
   */
  public includeColumn(column: McsFilterInfo): boolean {
    if (isNullOrEmpty(this._accessControlService)) { return true; }
    let columnFunc = this._columnPermissionMatrix.get(column.id);
    return columnFunc ? columnFunc() : true;
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

  /**
   * TODO: update method on new license creation
   * This will navigate to new license page
   */
  public onClickNewLicenseButton(): void {
    // navigate to route
  }

  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsLicense>> {
    return this._apiService.getLicenses(query);
  }

  /**
   * TODO: apply permissions
   */
  private _createColumnMatrix(): void {
    // create column matrix
  }

  private _subscribeToLicensesResolver(): void {
    this.licenses$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.licenses))
    );
  }

  /**
   * Returns true if current license has no running job
   */
  public isCurrentLicenseHasNoActiveJob(currentLicense: McsLicense, activeJobs: McsJob[]) {
    let hasActiveJob = activeJobs.find((job) => job?.clientReferenceObject?.serviceId === currentLicense.serviceId);
    if (isNullOrEmpty(hasActiveJob)) {
      return true;
    }
  }

  /**
   * Returns true if 1 or more active licenses without running jobs attached
   */
  public isLicensesActiveAndNoRunningJobs(licenses, activeJobs): boolean {
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
        this.changeDetectorRef.markForCheck();
        return true;
      }
    }

    if (activeLicenses.length > 0 && activeJobs.length === 0) {
      this.changeDetectorRef.markForCheck();
      return true;
    }
  }

  /**
   * Returns all licenses that has an active status and service Id
   */
  private getAllActiveLicenses(licenses: McsLicense[]): McsLicense[] {
    let licenseActiveWithServiceId: McsLicense[] = [];
    licenseActiveWithServiceId = licenses.filter((license) => license.serviceId !== null &&
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
}
