import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChange } from '../../dynamic-form-field-data.interface';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';
import { DynamicInputNumberField } from './input-number';

@Component({
  selector: 'mcs-dff-input-number-field',
  templateUrl: './input-number.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputNumberComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputNumberComponent extends DynamicTextFieldComponentBase {
  public data: DynamicInputNumberField;

  public onFormDataChange(params: DynamicFormFieldDataChange): void {
    throw new Error('Method not implemented.');
  }
}
