import {
  forwardRef,
  Component
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { McsIpValidatorService } from '@app/core';
import {
  compareStrings,
  isNullOrEmpty,
  removeNonAlphaNumericChars
} from '@app/utilities';
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
  private _tenant: string;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'tenant-change':
        let sameTenant = compareStrings(this._tenant, params?.value?.name) === 0;
        if (sameTenant || isNullOrEmpty(params?.value?.name)) { return; }
        this._tenant = params?.value?.name;
        this.config.value = this.formatShortCustomerName(params?.value?.name);
        this.valueChange(this.config.value);
        break;
    }
  }

  public formatShortCustomerName(text: string): string {
    // remove all non-alphanumeric and truncate to max of 16 chars
    return removeNonAlphaNumericChars(text).substring(0, 16);
  }
}
