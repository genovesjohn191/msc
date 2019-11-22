import {
  Component,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
  OnInit,
  OnChanges
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { McsServerHostSecurityAvLogContent } from '@app/models';
import {
  McsTableDataSource,
  CoreConfig
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-service-anti-virus-details',
  templateUrl: './anti-virus-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceAntiVirusDetailsComponent implements OnInit, OnChanges {

  @Input()
  public serverId: string;

  public avDatasource: McsTableDataSource<McsServerHostSecurityAvLogContent>;
  public avColumns: string[];

  private _avLogsCache: Observable<McsServerHostSecurityAvLogContent[]>;

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _coreConfig: CoreConfig,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.avColumns = [];
    this.avDatasource = new McsTableDataSource();
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
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.avColumns = Object.keys(
      this._translateService.instant('serverServicesAvDetails.columnHeaders')
    );
    if (isNullOrEmpty(this.avColumns)) {
      throw new Error('column definition for anti-virus was not defined');
    }
  }

  /**
   * Initializes the data source of the av logs table
   */
  private _updateTableDataSource(serverid: string): void {
    let avApiSource: Observable<McsServerHostSecurityAvLogContent[]>;
    if (!isNullOrEmpty(serverid)) {
      avApiSource = this._apiService.getServerHostSecurityAvLogs(serverid).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.content)),
        tap((response) => {
          this._avLogsCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._avLogsCache) ?
      avApiSource : this._avLogsCache;
    this.avDatasource.updateDatasource(tableDataSource);
    this._changeDetector.markForCheck();
  }
}
