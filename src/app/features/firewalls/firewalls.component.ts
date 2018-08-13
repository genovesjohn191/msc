import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { FirewallsRepository } from './repositories/firewalls.repository';
import { FirewallsDataSource } from './firewalls.datasource';
/** Models */
import { Firewall } from './models';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsRouteKey
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  getSafeProperty
} from '../../utilities';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent
  extends McsTableListingBase<FirewallsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_SVG_COG;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _firewallsRepository: FirewallsRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.firewalls;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
  }

  /**
   * Navigate to firewall details page
   * @param firewall Firewall to view the details
   */
  public navigateToFirewall(firewall: Firewall): void {
    if (isNullOrEmpty(firewall)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.FirewallDetail), firewall.id]);
  }

  /**
   * Retry obtaining datasource from firewalls
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Returns the totals record found in firewalls
   */
  protected get totalRecordsCount(): number {
    return getSafeProperty(this._firewallsRepository,
      (obj) => obj.totalRecordsCount, 0);
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
    this.dataSource = new FirewallsDataSource(
      this._firewallsRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
