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
  McsVCenterDatacentreQueryParam
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

interface VCenterDataCentreQuery {
  vcenterName: Observable<string>;
  companyId: Observable<string>;
}

export class SelectVCenterDataCentreDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _optionItemsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('vcenter-datacentre'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<VCenterDataCentreQuery>): void {
    if (isNullOrEmpty(prerequisite?.data?.vcenterName)) {
      throw new Error('VCenterName is required for vcenter-datacentre.');
    }

    combineLatest([
      prerequisite?.data.vcenterName,
      prerequisite?.data.companyId
    ]).pipe(
      startWith([null, null]),
      takeUntil(this._destroySubject),
      switchMap(([vcenterName, companyId]) => {
        let query = new McsVCenterDatacentreQueryParam();
        query.vcenter = vcenterName || null;

        if (companyId) {
          let optionalHeaders = new Map<string, string>();
          optionalHeaders.set('company-id', companyId);
          query.optionalHeaders = optionalHeaders;
        }

        return this._apiService.getVCenterDataCentres(query).pipe(
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