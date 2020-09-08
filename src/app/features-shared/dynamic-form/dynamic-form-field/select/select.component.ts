import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChange,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-data.interface';
import { DynamicSelectField } from './select';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-field',
  templateUrl: './select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectComponent extends DynamicSelectFieldComponentBase<void> {
  public data: DynamicSelectField;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChange): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<void[]> {
    throw new Error('Method not implemented.');
  }

  protected filter(collection: void[]): FlatOption[] | GroupedOption[] {
    throw new Error('Method not implemented.');
  }
}
