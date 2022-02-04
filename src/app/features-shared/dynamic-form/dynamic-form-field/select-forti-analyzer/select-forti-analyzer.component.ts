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
import {McsFirewallFortiAnalyzer } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFortiAnalyzerField } from './select-forti-analyzer';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-forti-analyzer',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectFortiAnalyzerComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectFortiAnalyzerComponent extends DynamicSelectFieldComponentBase<McsFirewallFortiAnalyzer> {
  public config: DynamicSelectFortiAnalyzerField;
  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsFirewallFortiAnalyzer[]> {
    return this._apiService.getFirewallFortiAnalyzers().pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        let returnValue = response && response.collection;
        return returnValue;
      })
    );
  }

  protected filter(collection: McsFirewallFortiAnalyzer[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      let option = { key: item.ipAddress, value: item.name } as FlatOption;
      options.push(option);
    });

    return options;
  }
}