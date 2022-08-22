import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { McsOption } from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';
import { FieldSelectPrerequisite } from '../field-select.prerequisite';

export class SelectVCenterDataCentreDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _optionItemsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('vcenter-datacentre'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<Observable<string>>): void {
    if (isNullOrEmpty(prerequisite?.data)) {
      throw new Error('CompanyId is required for vcenter-datacentre.');
    }

    prerequisite?.data.pipe(
      startWith(null),
      takeUntil(this._destroySubject),
      switchMap(companyId => {
        let optionalHeaders = new Map<string, string>();
        if (companyId) {
          optionalHeaders.set('company-id', companyId);
        }

        return this._apiService.getVCenterDataCentres(optionalHeaders).pipe(
          map(result => result?.collection
            ?.map(resultItem =>
              new McsOption(
                resultItem.id,
                resultItem.name,
                null,
                false,
                resultItem
              )
            )
          )
        );
      }),
      tap(optionItems => this._optionItemsChange.next(optionItems))
    ).subscribe();
  }

  public connect(): Observable<McsOption[]> {
    return this._optionItemsChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}