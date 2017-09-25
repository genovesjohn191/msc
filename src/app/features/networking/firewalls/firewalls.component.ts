import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { FirewallsService } from './firewalls.service';
import { FirewallsDataSource } from './firewalls.datasource';
/** Models */
import {
  Firewall,
  FirewallConnectionStatus
} from './models';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsSearch,
  McsPaginator
} from '../../../core';
import {
  isNullOrEmpty,
  refreshView
} from '../../../utilities';

@Component({
  selector: 'mcs-firewalls',
  templateUrl: './firewalls.component.html',
  styles: [require('./firewalls.component.scss')]
})

export class FirewallsComponent implements OnInit, AfterViewInit, OnDestroy {

  public firewallsTextContent: any;

  // Filter selector variables
  public columnSettings: any;

  // Table variables
  public dataSource: FirewallsDataSource;
  public dataColumns: string[];

  @ViewChild('search')
  public search: McsSearch;

  @ViewChild('paginator')
  public paginator: McsPaginator;

  public get totalRecordCount(): number {
    return isNullOrEmpty(this.dataSource) ? 0 : this.dataSource.totalRecordCount;
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_FIREWALLS_LISTING;
  }

  public get cogIconKey(): string {
    return CoreDefinition.ASSETS_FONT_GEAR;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _router: Router,
    private _firewallsService: FirewallsService
  ) {
  }

  public ngOnInit() {
    this.firewallsTextContent = this._textProvider.content.firewalls;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._initiliazeDatasource();
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this.dataSource)) {
      this.dataSource.disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
  }

  public getStatusIconKey(status: FirewallConnectionStatus): string {
    let iconKey = '';

    switch (status) {
      case FirewallConnectionStatus.Up:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallConnectionStatus.Down:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;

      case FirewallConnectionStatus.Unknown:
      default:
        // TODO: Confirm the icon for Unknown Status
        break;
    }

    return iconKey;
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: any): void {
    if (columns) {
      this.columnSettings = columns;
      let columnDetails = Object.keys(this.columnSettings);

      this.dataColumns = [];
      columnDetails.forEach((column) => {
        if (!this.columnSettings[column].value) { return; }
        this.dataColumns.push(column);
      });
    }
  }

  /**
   * Retry to obtain the source from API
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initiliazeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new FirewallsDataSource(
      this._firewallsService,
      this.paginator,
      this.search
    );
  }
}
