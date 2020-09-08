import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChange } from '../../dynamic-form-field-data.interface';
import { DynamicInputTextField } from './input-text';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';


@Component({
  selector: 'mcs-dff-input-text-field',
  templateUrl: './input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputTextComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputTextComponent extends DynamicTextFieldComponentBase {
  public data: DynamicInputTextField;

  public onFormDataChange(params: DynamicFormFieldDataChange): void {
    throw new Error('Method not implemented.');
  }
}
