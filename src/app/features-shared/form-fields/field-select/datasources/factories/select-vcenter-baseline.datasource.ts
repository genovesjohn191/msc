import {
  combineLatest,
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

import {
  McsOption,
  McsVCenterBaselineQueryParam
} from '@app/models';
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

interface VCenterBaselineQuery {
  vcenterName: Observable<string>;
  companyId: Observable<string>;
}

export class SelectVCenterBaselineDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _optionItemsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('vcenter-baseline'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<VCenterBaselineQuery>): void {
    if (isNullOrEmpty(prerequisite?.data?.vcenterName)) {
      throw new Error('VCenterId is required for vcenter-baselines.');
    }

    combineLatest([
      prerequisite?.data.vcenterName,
      prerequisite?.data.companyId
    ]).pipe(
      startWith([null, null]),
      takeUntil(this._destroySubject),
      switchMap(([vcenterName, companyId]) => {
        let query = new McsVCenterBaselineQueryParam();
        query.vcenter = vcenterName || null;

        let optionalHeaders = new Map<string, string>();
        if (companyId) {
          optionalHeaders.set('company-id', companyId);
        }

        return this._apiService.getVCenterBaselines(query, optionalHeaders).pipe(
          map(result => result?.collection
            ?.map(resultItem =>
              new McsOption(
                resultItem.id,
                resultItem.name,
                resultItem.description,
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