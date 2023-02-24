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

interface MonthInfo {
  name: string
  monthIndex: number;
}

export class SelectMonthDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();

  constructor() {
    super(new FieldSelectConfig('select-month', true));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<any>): void { }

  public connect(): Observable<McsOption[]> {
    let monthNames = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Get the past 12months information
    let targetMonts = new Array<MonthInfo>();
    let targetDate = new Date();
    targetDate.setDate(1);
    for (let idx = 0; idx <= 11; idx++) {
      let displayName = targetDate.getFullYear() === new Date().getFullYear() ?
        `${monthNames[targetDate.getMonth()]}` :
        `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

      targetMonts.push({
        name: displayName,
        monthIndex: targetDate.getMonth()
      });
      targetDate.setMonth(targetDate.getMonth() - 1);
    }

    return of(
      targetMonts.map(item => new McsOption(item.monthIndex, item.name))
    ).pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}