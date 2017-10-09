import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FirewallsService } from './firewalls.service';
import { FirewallsDataSource } from './firewalls.datasource';
/** Models */
import { FirewallConnectionStatus } from './models';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator,
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

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
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
    private _firewallsService: FirewallsService
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

  public getConnectionStatusIconKey(status: FirewallConnectionStatus): string {
    return this._firewallsService.getFirewallConnectionStatusIconKey(status);
  }

  /**
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this.initializeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource
    this.dataSource = new FirewallsDataSource(
      this._firewallsService,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }
}
