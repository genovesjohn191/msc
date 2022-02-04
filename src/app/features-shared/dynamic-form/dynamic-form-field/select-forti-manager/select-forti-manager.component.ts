import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import { McsFirewallFortiManager } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFortiManagerField } from './select-forti-manager';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-forti-manager',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectFortiManagerComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectFortiManagerComponent extends DynamicSelectFieldComponentBase<McsFirewallFortiManager> {
  public config: DynamicSelectFortiManagerField;

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsFirewallFortiManager[]> {
    return this._apiService.getFirewallFortiManagers().pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      })
    );
  }

  protected filter(collection: McsFirewallFortiManager[]): FlatOption[] {
    let options: FlatOption[] = [];
    collection.forEach((item) => {
      let option = { key: item.ipAddress, value: item.name } as FlatOption;
      options.push(option);
    });
    return options;
  }
}