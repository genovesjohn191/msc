import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';
import { DynamicInputPasswordField } from './input-password';


@Component({
  selector: 'mcs-dff-input-password-field',
  templateUrl: 'input-password.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputPasswordComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputPasswordComponent extends DynamicTextFieldComponentBase {
  public config: DynamicInputPasswordField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }
}
