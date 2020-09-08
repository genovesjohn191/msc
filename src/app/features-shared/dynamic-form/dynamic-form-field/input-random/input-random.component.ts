import {
  Component,
  forwardRef,
  AfterViewInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChange } from '../../dynamic-form-field-data.interface';
import { DynamicInputRandomField } from './input-random';
import { DynamicTextFieldComponentBase } from '../dynamic-text-field-component.base';
import { createRandomString, copyToClipboard } from '@app/utilities';

@Component({
  selector: 'mcs-dff-input-random-field',
  templateUrl: './input-random.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputRandomComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputRandomComponent
  extends DynamicTextFieldComponentBase
  implements AfterViewInit {

  public data: DynamicInputRandomField;

  public ngAfterViewInit(): void {
    if (this.data.value === '' && this.data.validators.required) {
      this.generate();
    }
  }

  public onFormDataChange(params: DynamicFormFieldDataChange): void {
    throw new Error('Method not implemented.');
  }

  public generate(): void {
    this.data.value =
      createRandomString(
        this.data.alphaCharCount,
        this.data.numericCharCount,
        this.data.specialCharCount,
        this.data.anyCharCount);

    this.valueChange(this.data.value);
  }

  public copy(element: any): void {
    copyToClipboard(element);
  }
}
