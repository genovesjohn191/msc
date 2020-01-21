import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  tap,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition,
} from '@app/utilities';
import {
  McsTableDataSource,
  CoreConfig
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  McsServerHostSecurityHidsLog,
  hostSecuritySeverityText,
  HostSecuritySeverity
} from '@app/models';

@Component({
  selector: 'mcs-service-hids-details',
  templateUrl: './hids-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceHidsDetailsComponent implements OnInit, OnChanges {

  @Input()
  public serverId: string;

  public hidsDatasource: McsTableDataSource<McsServerHostSecurityHidsLog>;
  public hidsColumns: string[];

  private _hidsLogsCache: Observable<McsServerHostSecurityHidsLog[]>;

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _coreConfig: CoreConfig,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.hidsColumns = [];
    this.hidsDatasource = new McsTableDataSource();
  }

  public ngOnInit(): void {
    this._setDataColumns();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let serverId = changes['serverId'];
    if (!isNullOrEmpty(serverId)) {
      this._updateTableDataSource(this.serverId);
    }
  }

  public get ellipsisKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get trendDsmLink(): string {
    return this._coreConfig.trendDsmUrl;
  }

  /**
   * Returns the severity label based on severity enum
   */
  public severityLabel(severity: HostSecuritySeverity): string {
    return hostSecuritySeverityText[severity];
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.hidsColumns = Object.keys(
      this._translateService.instant('serverServicesHidsDetails.columnHeaders')
    );
    if (isNullOrEmpty(this.hidsColumns)) {
      throw new Error('column definition for hids was not defined');
    }
  }

  /**
   * Initializes the data source of the hids logs table
   */
  private _updateTableDataSource(serverid: string): void {
    let hidsApiSource: Observable<McsServerHostSecurityHidsLog[]>;
    if (!isNullOrEmpty(serverid)) {
      hidsApiSource = this._apiService.getServerHostSecurityHidsLogs(serverid).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((response) => {
          this._hidsLogsCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._hidsLogsCache) ?
      hidsApiSource : this._hidsLogsCache;
    this.hidsDatasource.updateDatasource(tableDataSource);
    this._changeDetector.markForCheck();
  }
}
