import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectRetentionPeriodField } from './select-retention-period';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-dff-select-retention-period-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectRetentionPeriodComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectRetentionPeriodComponent extends DynamicSelectFieldComponentBase<void> {
  public config: DynamicSelectRetentionPeriodField;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'bat-change':
        this._updateBehavior(params.value);
        break;
    }
  }

  protected callService(): Observable<void[]> {
    throw new Error('Method not implemented.');
  }

  protected filter(collection: void[]): FlatOption[] | GroupedOption[] {
    throw new Error('Method not implemented.');
  }

  private _updateBehavior(bat: string ): void {
    let required = isNullOrEmpty(bat);

    this.updateVisiblityBasedOnRequirement(required);

    this._changeDetectorRef.markForCheck();
  }
}
