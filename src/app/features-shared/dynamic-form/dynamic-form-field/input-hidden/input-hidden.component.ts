import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputHiddenField } from './input-hidden';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { McsNetworkVdcSubnet } from '@app/models';

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
export class DynamicInputHiddenComponent extends DynamicFieldComponentBase {
  public config: DynamicInputHiddenField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'gateway-ip-change':
        let subnet = params.value as McsNetworkVdcSubnet;
        this.config.value = subnet.prefixLength;
        this.valueChange(this.config.value);
        break;
    }
  }
}
