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
import { DynamicSelectVcloudTypeField } from './select-vcloud-type';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { isNullOrEmpty } from '@app/utilities';

@Component({
  selector: 'mcs-dff-select-vcloud-type-field',
  templateUrl: './select-vcloud-type.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectVcloudTypeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectVcloudTypeComponent extends DynamicSelectFieldComponentBase<void> {
  public config: DynamicSelectVcloudTypeField;
  public showField: boolean = true;

  constructor(_changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vcloud-instance-change':
        if (params.value === '') {
          this.showField = false;
          return;
        }
        this.showField = true;
        break;
    }
  }

  protected callService(): Observable<void[]> {
    throw new Error('Method not implemented.');
  }

  protected filter(collection: void[]): FlatOption[] | GroupedOption[] {
    throw new Error('Method not implemented.');
  }
}
