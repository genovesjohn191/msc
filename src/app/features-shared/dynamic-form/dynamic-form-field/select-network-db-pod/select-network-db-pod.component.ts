import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectNetworkDbPodField } from './select-network-db-pod';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { McsNetworkDbPod, NetworkDbPodType } from '@app/models';
import { McsApiService } from '@app/services';
import { map, takeUntil } from 'rxjs/operators';
import { isNullOrUndefined } from '@app/utilities';

@Component({
  selector: 'mcs-dff-select-network-db-pod-field',
  templateUrl: '../shared-template/select.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkDbPodComponent),
      multi: true
    }
  ]
})
export class DynamicSelectNetworkDbPodComponent extends DynamicSelectFieldComponentBase<McsNetworkDbPod> {
  public config: DynamicSelectNetworkDbPodField;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  protected callService(): Observable<McsNetworkDbPod[]> {
    return this._apiService.getNetworkDbPods().pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      }));
  }

  protected filter(collection: McsNetworkDbPod[]): FlatOption[] {
    let options: FlatOption[] = [];
    collection.sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        if (this._exluded(item)) { return; }
        let option : FlatOption = {
          type: 'flat',
          key: item.code,
          value: item.name,
          hint: item.description
        }
        options.push(option);
      });
    return options;
  }

  private _exluded(item: McsNetworkDbPod): boolean {
    if (this.config.disableNonLaunch && !(item.type === NetworkDbPodType.Launch)) {
      return true;
    }
    return false;
  }
}
