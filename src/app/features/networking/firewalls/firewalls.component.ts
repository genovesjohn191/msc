import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { FirewallsRepository } from './firewalls.repository';
import { FirewallsDataSource } from './firewalls.datasource';
/** Models */
import { Firewall } from './models';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView,
  getRecordCountLabel
} from '../../../utilities';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  styleUrls: ['./firewalls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallsComponent
  extends McsTableListingBase<FirewallsDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._firewallsRepository) ? 0 :
      this._firewallsRepository.totalRecordsCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALLS_LISTING;
  }

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
    this._router.navigate(['/networking/firewalls/', firewall.id]);
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
