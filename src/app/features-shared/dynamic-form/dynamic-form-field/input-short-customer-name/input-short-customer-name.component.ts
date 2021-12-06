import {
  forwardRef,
  Component
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { McsIpValidatorService } from '@app/core';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputShortCustomerNameField } from './input-short-customer-name';

@Component({
  selector: 'mcs-dff-input-short-customer-name-field',
  templateUrl: '../shared-template/input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputShortCustomerNameComponent),
      multi: true
    },
    McsIpValidatorService
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputShortCustomerNameComponent extends DynamicInputTextComponent {
  public config: DynamicInputShortCustomerNameField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'tenant-change':
        this.config.value = params.value.name;
        this.valueChange(this.config.value);
        break;
    }
  }
}
