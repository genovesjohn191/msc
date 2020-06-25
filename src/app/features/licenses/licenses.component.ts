import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  RouteKey
} from '@app/models';
import {
  getSafeProperty,
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-licenses',
  templateUrl: './licenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicensesComponent extends McsTableListingBase<McsLicense> implements OnInit, OnDestroy, IMcsColumnManager {

  public licenses$: Observable<McsLicense[]>;

  private _columnPermissionMatrix = new Map<string, () => boolean>();

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _activatedRoute: ActivatedRoute,
    private _accessControlService: McsAccessControlService,
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

  public ngOnInit(): void {
    this._subscribeToLicensesResolver();
  }

  public ngOnDestroy(): void {
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
   * Returns true when the column is included in the display
   */
  public includeColumn(column: McsFilterInfo): boolean {
    if (isNullOrEmpty(this._accessControlService)) { return true; }
    let columnFunc = this._columnPermissionMatrix.get(column.id);
    return columnFunc ? columnFunc() : true;
  }

  /**
   * Returns true if the selected license has a suspended or pending parent license
   */
  public isLicenseDisabled(licenses: McsLicense[], currentLicense: McsLicense): boolean {
    if (isNullOrEmpty(currentLicense)) { return true; }
    if (isNullOrEmpty(currentLicense.parentServiceId)) { return currentLicense.isPending || currentLicense.isSuspended; }

    let parentLicense = licenses.find((license) => license.serviceId === currentLicense.parentServiceId);
    if (isNullOrEmpty(parentLicense)) { return true; }

    return parentLicense.isPending || parentLicense.isSuspended || currentLicense.isPending || currentLicense.isSuspended;
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
}
