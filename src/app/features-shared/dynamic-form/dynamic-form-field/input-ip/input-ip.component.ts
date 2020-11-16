import {
  ChangeDetectorRef,
  Component,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonDefinition, isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-data.interface';
import { DynamicInputTextComponent } from '../input-text/input-text.component';
import { DynamicInputIpField } from './input-ip';

@Component({
  selector: 'mcs-dff-input-ip-field',
  templateUrl: '../shared-template/input-text.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputIpComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicInputIpComponent extends DynamicInputTextComponent {
  public data: DynamicInputIpField;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'ip-mode-change': {
        this._updateBehavior(params.value);
      }
    }
  }

  private _updateBehavior(mode: string ): void {
    let required = mode.toLowerCase() === 'manual';

    let hasValidators = !isNullOrEmpty(this.data.validators);
    if (hasValidators) {
      this.data.validators.required = required

    } else {
      this.data.validators = { required };
    }

    let hasSettings = !isNullOrEmpty(this.data.settings);
    if (hasSettings) {
      this.data.settings.hidden = !required;
    } else {
      this.data.settings = { hidden: !required };
    }

    this.disabled = !required;
    this.clearFormField(false);

    this._changeDetectorRef.markForCheck();
  }
}
