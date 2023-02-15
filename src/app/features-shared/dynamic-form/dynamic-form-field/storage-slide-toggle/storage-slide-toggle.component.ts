import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { McsStorageSize } from '@app/models';

import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent
} from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicStorageSlideToggleField } from './storage-slide-toggle';

@Component({
  selector: 'mcs-dff-storage-slide-toggle-field',
  templateUrl: './storage-slide-toggle.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicStorageSlideToggleComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicStorageSlideToggleComponent extends DynamicFieldComponentBase {
  public config: DynamicStorageSlideToggleField;
  public storageToggle: McsStorageSize = {
    default: false,
    preview: false
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this.config.value = this.storageToggle.default;
        this.valueChange(this.config.value);
        break;
    }
  }

  public defaultToggleChange(defaultValue: MatSlideToggleChange): void {
    this.storageToggle.default = defaultValue.checked;
    this.config.value = this.storageToggle.default;
    this.valueChange(this.config.value);
    this.notifyForDataChange(this.config.eventName, this.config.dependents);
  }

  public previewToggleChange(previewValue: MatSlideToggleChange): void {
    this.storageToggle.preview = previewValue.checked;
    this.notifyForDataChange(this.config.eventName, this.config.dependents);
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.storageToggle,
      eventName,
      dependents
    });
  }
}