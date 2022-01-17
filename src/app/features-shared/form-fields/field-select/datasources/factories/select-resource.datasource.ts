import {
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  takeUntil
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

export class SelectResourceDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();

  constructor(private _apiService: McsApiService) {
    super(new FieldSelectConfig('resource'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<any>): void { }

  public connect(): Observable<McsOption[]> {
    return this._apiService.getResources().pipe(
      takeUntil(this._destroySubject),
      map((response) => {
        let dedicatedResources = response?.collection
          ?.filter(resource => !resource.isDedicated);
        if (isNullOrEmpty(dedicatedResources)) { return []; }

        return dedicatedResources
          .map(resource => new McsOption(resource, resource.name));
      })
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}