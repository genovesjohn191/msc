import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import { McsAccessControlService } from '@app/core';
import {
  McsOption,
  PlatformType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';

export class SelectServerConsoleDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _dataRecordsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(
    private _accessControl: McsAccessControlService,
    private _apiService: McsApiService,
    private _translate: TranslateService
  ) {
    super(new FieldSelectConfig('server-console'));
  }

  public initialize(): void {
    this._apiService.getServers().pipe(
      map(result => {
        if (isNullOrEmpty(result?.collection)) { return; }

        let filteredServers = result.collection.filter(vm => {
          if (vm.platform?.type !== PlatformType.VCloud) { return false; }

          let dedicatedFlag = this._accessControl
            .hasAccessToFeature('EnableDedicatedVmConsole');
          return vm.isDedicated ? dedicatedFlag : true;
        });

        return filteredServers
          ?.map(resultItem => new McsOption(
            resultItem.id,
            resultItem.name,
            this._translate.instant('message.consoleUnavailable', { state: resultItem.statusLabel }),
            !resultItem.isPoweredOn,
            resultItem
          ));
      }),
      tap(options => this._dataRecordsChange.next(options))
    ).subscribe();
  }

  public connect(): Observable<McsOption[]> {
    return this._dataRecordsChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}