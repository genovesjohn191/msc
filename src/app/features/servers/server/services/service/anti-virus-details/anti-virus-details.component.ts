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
  McsFilterInfo,
  McsServerHostSecurityAvLog
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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-service-anti-virus-details',
  templateUrl: './anti-virus-details.component.html',
  host: {
    'class': 'block'
  }
})
export class ServiceAntiVirusDetailsComponent implements OnChanges, OnDestroy {

  @Input()
  public serverId: string;

  public readonly avDatasource: McsTableDataSource2<McsServerHostSecurityAvLog>;
  public readonly avColumns: McsFilterInfo[];

  private _avLogsCache: Observable<McsServerHostSecurityAvLog[]>;
  private _avRecordsChange = new BehaviorSubject<McsServerHostSecurityAvLog[]>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _coreConfig: CoreConfig,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.avDatasource = new McsTableDataSource2(this._getAntiviruses.bind(this));
    this.avColumns = [
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'threat' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'date' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'path' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'scanType' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'actionTaken' })
    ];
    this.avDatasource.registerColumnsFilterInfo(this.avColumns);
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

  private _updateTableDataSource(serverid: string): void {
    let avApiSource: Observable<McsServerHostSecurityAvLog[]>;
    if (!isNullOrEmpty(serverid)) {
      avApiSource = this._apiService.getServerHostSecurityAvLogs(serverid).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((response) => {
          this._avLogsCache = of(response);
        })
      );
    }

    let tableDataSource = isNullOrEmpty(this._avLogsCache) ? avApiSource : this._avLogsCache;
    tableDataSource.subscribe(records => this._avRecordsChange.next(records || []));
    this._changeDetector.markForCheck();
  }

  private _getAntiviruses(_param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServerHostSecurityAvLog>> {
    return this._avRecordsChange.pipe(
      takeUntil(this._destroySubject),
      filter(response => !isNullOrUndefined(response)),
      map(response => new McsMatTableContext(response, response?.length))
    );
  }
}
