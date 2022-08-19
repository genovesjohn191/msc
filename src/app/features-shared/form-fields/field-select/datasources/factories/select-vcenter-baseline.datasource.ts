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
import { TranslateService } from '@ngx-translate/core';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';
import { FieldSelectPrerequisite } from '../field-select.prerequisite';

interface VCenterBaselineQuery {
  vcenterName: Observable<string>;
  companyId: Observable<string>;
  activeIds: Observable<string[]>;
}

export class SelectVCenterBaselineDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _optionItemsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService, private _translate: TranslateService) {
    super(new FieldSelectConfig('vcenter-baseline'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<VCenterBaselineQuery>): void {
    if (isNullOrEmpty(prerequisite?.data?.vcenterName)) {
      throw new Error('VCenterId is required for vcenter-baselines.');
    }

    combineLatest([
      prerequisite?.data.vcenterName,
      prerequisite?.data.companyId,
      prerequisite?.data.activeIds
    ]).pipe(
      startWith([null, null, null]),
      takeUntil(this._destroySubject),
      switchMap(([vcenterName, companyId, activeIds]) => {
        let query = new McsVCenterBaselineQueryParam();
        query.vcenter = vcenterName || null;

        if (companyId) {
          let optionalHeaders = new Map<string, string>();
          optionalHeaders.set('company-id', companyId);
          query.optionalHeaders = optionalHeaders;
        }
        let activeBaselineIds = activeIds || new Array<string>();

        return this._apiService.getVCenterBaselines(query, false).pipe(
          map(result => result?.collection
            ?.filter(item => item.approved)
            ?.map(resultItem =>
              new McsOption(
                resultItem.id,
                resultItem.name,
                `${this._translate.instant('message.remediateBaselineInProgress')}`,
                activeBaselineIds.find(baselineId => baselineId === resultItem.id),
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