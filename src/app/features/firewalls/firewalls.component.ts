import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsFirewall
} from '@app/models';
import { McsFirewallsRepository } from '@app/services';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent
  extends McsTableListingBase<McsTableDataSource<McsFirewall>>
  implements AfterViewInit, OnDestroy {

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _firewallsRepository: McsFirewallsRepository
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Navigate to firewall details page
   * @param firewall Firewall to view the details
   */
  public navigateToFirewall(firewall: McsFirewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.FirewallDetail), firewall.id]);
  }

  /**
   * Retry obtaining datasource from firewalls
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALLS_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource
    this.dataSource = new McsTableDataSource(this._firewallsRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }
}
