import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  CoreDefinition,
  McsTableListingBase,
  CoreRoutes
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  RouteKey,
  McsFirewall,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent extends McsTableListingBase<McsFirewall> {

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, { dataChangeEvent: McsEvent.dataChangeFirewalls });
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
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.FirewallDetails), firewall.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALLS_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsFirewall>> {
    return this._apiService.getFirewalls(query);
  }
}
