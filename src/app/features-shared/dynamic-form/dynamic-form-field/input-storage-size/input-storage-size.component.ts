import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

import {
  coerceNumber,
  convertGbToMb,
  isNullOrUndefined
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicInputStorageSizeField } from './input-storage-size';

@Component({
  selector: 'mcs-dff-input-storage-size-field',
  templateUrl: './input-storage-size.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputStorageSizeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicInputStorageSizeComponent extends DynamicFieldComponentBase {
  public config: DynamicInputStorageSizeField;
  public limitMB: number = 0;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._setLimitMbValue();
        break;
    }
  }

  private _setLimitMbValue(): void {
    this.limitMB = this._mapLimitMbCrispElementAttribute() || 0;
    this.config.value = this._convertedLimitMbValue();
    this.valueChange(this.config.value);
  }

  private _convertedLimitMbValue(): number {
    if (isNullOrUndefined(this.limitMB)) { return 0; }
    return convertGbToMb(this.limitMB);
  }

  private _mapLimitMbCrispElementAttribute(): number {
    return coerceNumber(this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.ProvisionQuotaGib2).value);
  }
}
