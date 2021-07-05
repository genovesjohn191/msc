import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import { Observable } from 'rxjs';

import { McsApiService } from '@app/services';
import {
  McsNetworkDbUseCase,
  McsQueryParam
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectNetworkDbUseCaseField } from './select-network-db-use-case';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';

@Component({
  selector: 'mcs-dff-select-network-db-use-case-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkDbUseCaseComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectNetworkDbUseCaseComponent extends DynamicSelectFieldComponentBase<McsNetworkDbUseCase> {
  public config: DynamicSelectNetworkDbUseCaseField;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsNetworkDbUseCase[]> {
    let param = new McsQueryParam();
    param.pageSize = 2000;

    return this._apiService.getNetworkDbUseCases(param).pipe(
      takeUntil(this.destroySubject),
      map((response) => response && response.collection));
  }

  protected filter(collection: McsNetworkDbUseCase[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({ type: 'flat', key: item.id.toString(), value: item.name });
    });

    return options;
  }
}
