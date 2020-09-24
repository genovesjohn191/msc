import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  GroupedOption,
  FlatOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectGroupField } from './select-group';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-group-field',
  templateUrl: './select-group.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectGroupComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectGroupComponent extends DynamicSelectFieldComponentBase<void> {
  public data: DynamicSelectGroupField;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<void[]> {
    throw new Error('Method not implemented.');
  }

  protected filter(collection: void[]): FlatOption[] | GroupedOption[] {
    throw new Error('Method not implemented.');
  }
}
