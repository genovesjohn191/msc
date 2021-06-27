import {
  of,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {
  CoreConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  hostSecuritySeverityText,
  HostSecuritySeverity,
  McsFilterInfo,
  McsServerHostSecurityHidsLog
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-service-hids-details',
  templateUrl: './hids-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceHidsDetailsComponent implements OnChanges, OnDestroy {

  @Input()
  public serverId: string;

  public readonly hidsDatasource: McsTableDataSource2<McsServerHostSecurityHidsLog>;
  public readonly hidsColumns: McsFilterInfo[];

  private _hidsLogsCache: Observable<McsServerHostSecurityHidsLog[]>;
  private _hidsLogsChange = new BehaviorSubject<McsServerHostSecurityHidsLog[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _coreConfig: CoreConfig,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.hidsDatasource = new McsTableDataSource2(this._getHidsLogs.bind(this));
    this.hidsColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'threat' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'date' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'applicationType' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'interface' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'sourceIp' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'destinationIp' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'actionTaken' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'severity' })
    ];
    this.hidsDatasource.registerColumnsFilterInfo(this.hidsColumns);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let serverId = changes['serverId'];
    if (!isNullOrEmpty(serverId)) {
      this._updateTableDataSource(this.serverId);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
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
    tableDataSource.subscribe(records => this._hidsLogsChange.next(records || []));
    this._changeDetector.markForCheck();
  }

  private _getHidsLogs(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerHostSecurityHidsLog>> {
    return this._hidsLogsChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
