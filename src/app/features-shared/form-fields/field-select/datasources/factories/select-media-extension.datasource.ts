import {
  of,
  Observable,
  Subject
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { McsOption } from '@app/models';
import {
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import {
  FieldSelectConfig,
  FieldSelectDatasource
} from '../../field-select.datasource';
import { FieldSelectPrerequisite } from '../field-select.prerequisite';

export class SelectMediaExtensionDatasource extends FieldSelectDatasource {
  private _destroySubject = new Subject();

  constructor() {
    super(new FieldSelectConfig('media-extension'));
  }

  public initialize(prerequisite?: FieldSelectPrerequisite<any>): void { }

  public connect(): Observable<McsOption[]> {
    return of([
      new McsOption(`.${CommonDefinition.FILE_EXTENSION_ISO}`, CommonDefinition.FILE_EXTENSION_ISO),
      new McsOption(`.${CommonDefinition.FILE_EXTENSION_OVA}`, CommonDefinition.FILE_EXTENSION_OVA)
    ]).pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }
}