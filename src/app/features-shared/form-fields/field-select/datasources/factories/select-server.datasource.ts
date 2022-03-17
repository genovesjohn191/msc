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

import { McsOption } from '@app/models';
import { McsApiService } from '@app/services';
import { unsubscribeSafely } from '@app/utilities';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';

export class SelectServerDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _dataRecordsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('servers'));
  }

  public initialize(): void {
    this._apiService.getServers().pipe(
      map(result =>
        result?.collection
          ?.map(resultItem => new McsOption(resultItem.id, resultItem.name))
      ),
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