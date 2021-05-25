import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { CoreValidators } from '@app/core';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldInputUrl } from './field-input-url';

@Component({
  selector: 'mcs-field-input-url',
  templateUrl: './field-input-url.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-input-url'
  }
})
export class FieldInputUrlComponent
  extends FormFieldBaseComponent2<string>
  implements IFieldInputUrl, OnDestroy {

  constructor(_injector: Injector) {
    super(_injector);
    this.registerCustomValidators(CoreValidators.url);
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }
}