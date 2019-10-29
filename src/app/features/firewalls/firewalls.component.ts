import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  McsTableListingBase,
  McsNavigationService,
  IMcsColumnManager,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  RouteKey,
  McsFirewall,
  McsQueryParam,
  McsApiCollection,
  McsFilterInfo
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent extends McsTableListingBase<McsFirewall> implements IMcsColumnManager {

  private _columnPermissionMatrix = new Map<string, () => boolean>();

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeFirewalls
    });
    this._createColumnMatrix();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  /**
   * Navigate to firewall details page
   * @param firewall Firewall to view the details
   */
  public navigateToFirewall(firewall: McsFirewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._navigationService.navigateTo(RouteKey.FirewallDetails, [firewall.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_FIREWALLS_LISTING;
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
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsFirewall>> {
    return this._apiService.getFirewalls(query);
  }

  /**
   * Creates the column permission matrix
   */
  private _createColumnMatrix(): void {
    this._columnPermissionMatrix.set('serialNumber',
      () => this._accessControlService.hasPermission(
        ['FirewallSerialNumberView']
      )
    );
  }
}
