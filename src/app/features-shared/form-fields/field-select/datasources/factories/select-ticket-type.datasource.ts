import {
  of,
  Observable,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ticketTypeOptions,
  McsOption
} from '@app/models';
import { unsubscribeSafely } from '@app/utilities';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';
import { FieldSelectPrerequisite } from '../field-select.prerequisite';

export class SelectTicketTypeDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();

  constructor() {
    super(new FieldSelectConfig('ticket-type'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<any>): void { }

  public connect(): Observable<McsOption[]> {
    return of(ticketTypeOptions).pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}