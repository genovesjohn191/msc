import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicExpansionSlideToggleField } from './expansion-slide-toggle';

@Component({
  selector: 'mcs-dff-expansion-slide-toggle-field',
  templateUrl: './expansion-slide-toggle.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicExpansionSlideToggleComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicExpansionSlideToggleComponent extends DynamicFieldComponentBase {
  public config: DynamicExpansionSlideToggleField;
  public showField: boolean = true;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vcloud-instance-change':
        this.config.value = true;
        this.valueChange(this.config.value);
        if (params.value === '') {
          this.showField = false;
          return;
        }
        this.showField = true;
        break;
    }
  }
}
