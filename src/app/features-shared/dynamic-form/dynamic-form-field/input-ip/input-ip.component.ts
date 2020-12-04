import {
  ChangeDetectorRef,
  Component,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNullOrEmpty } from '@app/utilities';
import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
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
  public config: DynamicInputIpField;
  private _hasInitialized: boolean = false;

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

    let hasValidators = !isNullOrEmpty(this.config.validators);
    if (hasValidators) {
      this.config.validators.required = required

    } else {
      this.config.validators = { required };
    }

    let hasSettings = !isNullOrEmpty(this.config.settings);
    if (hasSettings) {
      this.config.settings.hidden = !required;
    } else {
      this.config.settings = { hidden: !required };
    }

    this.disabled = !required;

    this.clearFormField(false);

    // Set initial value if required
    if (required && !this._hasInitialized) {
      this.setInitialValue(this.config.initialValue);
      this._hasInitialized = true;
    }

    this._changeDetectorRef.markForCheck();
  }
}
