import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicInputTargetFirmwareVersionField } from './input-target-firmware-version';

@Component({
  selector: 'mcs-dff-input-target-firmware-version-field',
  templateUrl: 'input-target-firmware-version.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputTargetFirmwareVersionComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputTargetFirmwareVersionComponent extends DynamicFieldComponentBase {
  public config: DynamicInputTargetFirmwareVersionField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }
}
