import {
  of,
  Observable,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McsOption } from '@app/models';
import { unsubscribeSafely } from '@app/utilities';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';
import { FieldSelectPrerequisite } from '../field-select.prerequisite';

export class SelectMonthDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();

  constructor() {
    super(new FieldSelectConfig('select-month', true));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<any>): void { }

  public connect(): Observable<McsOption[]> {
    let allMonths = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return of(
      allMonths.map((item, index) => new McsOption(index, item))
    ).pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}