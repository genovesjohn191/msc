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
import { DynamicSelectMultipleField } from './select-multiple';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-multiple-field',
  templateUrl: './select-multiple.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './select-multiple.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectMultipleComponent),
      multi: true
    }
  ]
})
export class DynamicSelectMultipleComponent extends DynamicSelectFieldComponentBase<void> {
  public data: DynamicSelectMultipleField;
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
