import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInput } from './field-input';

@Component({
  selector: 'mcs-field-input',
  templateUrl: './field-input.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input'
  }
})
export class FieldInputComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInput, OnDestroy {

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }
}