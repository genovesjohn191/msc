import {
  Component,
  forwardRef,
  AfterViewInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputRandomField } from './input-random';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
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
  extends DynamicFieldComponentBase
  implements AfterViewInit {

  public config: DynamicInputRandomField;

  public ngAfterViewInit(): void {
    if (this.config.value === '' && this.config.validators.required) {
      this.generate();
    }
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  public generate(): void {
    this.config.value =
    createRandomString(
      this.config.alphaCharCount,
      this.config.numericCharCount,
      this.config.specialCharCount,
      this.config.anyCharCount);

    this.valueChange(this.config.value);
  }

  public copy(element: any): void {
    copyToClipboard(element);
  }
}
