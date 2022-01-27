import {
  of,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
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

export class SelectResourceCatalogDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();
  private _resourceCatalogOptionsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('resource'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<Observable<string>>): void {
    if (isNullOrEmpty(prerequisite?.data)) {
      throw new Error('Resource Id is required for resource catalogs.');
    }

    prerequisite.data.pipe(
      takeUntil(this._destroySubject),
      switchMap(resourceId => {
        if (isNullOrEmpty(resourceId)) { return of([]); }

        return this._apiService.getResourceCatalogs(resourceId).pipe(
          map(result => result?.collection
            ?.map(resultItem => new McsOption(resultItem, resultItem.name)))
        );
      }),
      tap(optionItems => this._resourceCatalogOptionsChange.next(optionItems))
    ).subscribe();
  }

  public connect(): Observable<McsOption[]> {
    return this._resourceCatalogOptionsChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}