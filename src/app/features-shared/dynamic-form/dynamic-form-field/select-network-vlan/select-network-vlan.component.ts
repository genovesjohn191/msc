import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map, tap } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsNetworkDbNetwork,
  McsNetworkDbNetworkQueryParams,
  McsObjectVdcQueryParams,
  McsResource
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectNetworkVlanField } from './select-network-vlan';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DynamicInputAutocompleteFieldComponentBase } from '../dynamic-input-autocomplete-component.base';

@Component({
  selector: 'mcs-dff-select-network-vlan-field',
  templateUrl: './select-network-vlan.component.html',
  styleUrls: [
    './select-network-vlan.component.scss',
    '../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkVlanComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})
export class DynamicSelectNetworkVlanComponent extends DynamicInputAutocompleteFieldComponentBase<McsNetworkDbNetwork> {
  public config: DynamicSelectNetworkVlanField;
  public vlanText: string = 'default text';
  public showVlanText: boolean = false;

  // Filter variables
  private _resource: McsResource;
  private _companyId: string = '';
  private _serviceId: string = '';
  private _network: McsNetworkDbNetwork;

  public constructor(
    private _apiService: McsApiService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'service-id-change':
        this._serviceId = params.value;
        this.retrieveOptions();
        break;

      case 'company-change':
        this._companyId = params.value;

        this.config.value = '';
        this.inputCtrl.setValue('');
        this.valueChange(this.config.value);
        this.retrieveOptions();
        break;

      case 'resource-change':
        this._resource = params.value as McsResource;
        this._updateVlanText();
        break;
    }
  }

  public setValue(value: string): void {
    let validCustomInput = this.config.allowCustomInput && !isNullOrEmpty(value?.trim());
    if (validCustomInput) {
      this._trySetValue(value?.trim());
    }
  }

  private _trySetValue(value: string): void {
    let existingNetwork = this.collection.find(item => item.name.toLowerCase() === value.toLowerCase());

    if (isNullOrUndefined(existingNetwork)) {
      this.config.value = value;
      this._updateVlanText(true);
      this.valueChange(this.config.value);
      return;
    }

    this.config.value = existingNetwork.id;
    this.valueChange(this.config.value);
    this._updateNetworkDetails(existingNetwork.id);
  }

  public search(selectedOption: string): Observable<FlatOption[]> {
    if (typeof selectedOption === 'object') {
      return of(this.config.options.filter(option => option.key.indexOf(option.key) === 0));
    }

    const filterValue = selectedOption.toLowerCase();

    return of(this.config.options.filter(option =>
      option.value.toLowerCase().indexOf(filterValue) >= 0
      || option.key.toLowerCase().indexOf(filterValue) >= 0));
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    let option = event.option.value as FlatOption;
    this._trySetValue(option.value);
  }

  public getOptionValue(opt: FlatOption) {
    if (isNullOrEmpty(opt)) { return }
    return opt.value;
  }

  protected callService(): Observable<McsNetworkDbNetwork[]> {
    if (isNullOrEmpty(this._companyId)) { return of([]); }

    let queryParam = new McsNetworkDbNetworkQueryParams();
    queryParam.companyId = this._companyId;

    return this._apiService.getNetworkDbNetworks(queryParam).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.collection;
      }));
  }

  protected filter(collection: McsNetworkDbNetwork[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      const hintText = isNullOrEmpty(item.serviceId) ? '' : item.serviceId +
        isNullOrEmpty(item.description) ? '' : ' - ' + item.description;
      options.push({ type: 'flat', key: item.id, value: item.name, hint: hintText });
    });

    return options;
  }

  private _updateVlanText(isNewNetwork: boolean = false): void {
    if (isNullOrEmpty(this._resource) || isNullOrUndefined(this._network)) { return }

    if (isNewNetwork) {
      this.vlanText = 'A new network will be created and a new VLAN allocated for it.';
      this.showVlanText = true;
      this.hasError = false;
      return;
    }

    let queryParam = new McsObjectVdcQueryParams();
    queryParam.vdcId = this._resource.id;
    queryParam.networkServiceId = this._serviceId;
    queryParam.companyId = this._companyId;

    queryParam.networkId = this._network?.id;

    this._apiService.getVdcNetworkPrecheck(queryParam).pipe(
      takeUntil(this.destroySubject),
      tap((response) => {
        this.vlanText = isNullOrUndefined(response.vlanId) ?
          'A new VLAN will be allocated for this network' : 'VLAN: ' + response.vlanId;
        this.showVlanText = true;
      })).subscribe();
  }

  private _updateNetworkDetails(key: string) {
    this._startProcess();
    this._apiService.getNetworkDbNetwork(key).pipe(
      tap((response) => {
        this._endProcess(false);
        this._network = response;
        this._updateVlanText();
      })).subscribe();
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    if (!isNullOrEmpty(value) && !isNullOrUndefined(this.config.value)) {
      let dataValue = this.collection.find(item => item.id === value);
      this.dataChange.emit({
        value: isNullOrUndefined(dataValue) ? this.config.value : dataValue,
        eventName,
        dependents
      });
    }
  }

}
