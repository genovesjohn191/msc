import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-data.interface';
import { DynamicInputHiddenField } from './input-hidden';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';

@Component({
  selector: 'mcs-dff-input-hidden-field',
  templateUrl: './input-hidden.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputHiddenComponent),
      multi: true
    }
  ]
})
export class DynamicInputHiddenComponent extends DynamicTextFieldComponentBase {
  public data: DynamicInputHiddenField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }
}
