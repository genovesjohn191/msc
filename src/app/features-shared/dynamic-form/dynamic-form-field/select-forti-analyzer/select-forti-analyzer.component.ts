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
import {McsFirewallFortiAnalyzer, McsFwFortiAnalyzerQueryParams } from '@app/models';
import { McsApiService } from '@app/services';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption,
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFortiAnalyzerField } from './select-forti-analyzer';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { CommonDefinition } from '@app/utilities';

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
  private _companyId: string = '';

  constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;
    }
  }

  protected callService(): Observable<McsFirewallFortiAnalyzer[]> {    
    let query = new McsFwFortiAnalyzerQueryParams();
    query.mode = 'Analyzer';

    let optionalHeaders = new Map<string, any>([
      [CommonDefinition.HEADER_COMPANY_ID, this._companyId]
    ]);

    return this._apiService.getFirewallFortiAnalyzers(query, optionalHeaders).pipe(
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
      let option = { key: item.ipAddress, value: item.name, hint: item.description } as FlatOption;
      options.push(option);
    });

    return options;
  }
}