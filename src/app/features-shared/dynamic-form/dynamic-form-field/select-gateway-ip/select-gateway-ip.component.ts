import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil, map } from 'rxjs/operators';
import {
  of,
  Observable
} from 'rxjs';

import {
  CommonDefinition,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsNetworkDbNetwork,
  McsNetworkVdcSubnet,
  McsObjectVdcQueryParams,
  McsResource
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectGatewayIpField } from './select-gateway-ip';
import { TranslateService } from '@ngx-translate/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DynamicInputAutocompleteFieldComponentBase } from '../dynamic-input-autocomplete-component.base';

const defaultPrefixLength = 27;
const prefixMinSelfManaged = 16;
const prefixMinManaged = 16;
const reserveNewSubnetValue = 'Reserve a new subnet';
const Netmask = require('netmask').Netmask;

@Component({
  selector: 'mcs-dff-select-gateway-ip-field',
  templateUrl: './select-gateway-ip.component.html',
  styleUrls: [
    './select-gateway-ip.component.scss',
    '../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectGatewayIpComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicSelectGatewayIpComponent extends DynamicInputAutocompleteFieldComponentBase<McsNetworkVdcSubnet> {
  public config: DynamicSelectGatewayIpField;

  public prefixLength: number = defaultPrefixLength;
  public prefixDisabled: boolean = false;
  public prefixHint: string = '';
  public prefixError: boolean = false;
  public inputError: string = '';

  public isNetworkExisting: boolean = true;
  public reserveNewSubnetValue = reserveNewSubnetValue;

  // Filter variables
  private _resource: McsResource;
  private _companyId: string = '';
  private _serviceId: string = '';
  private _network: McsNetworkDbNetwork;

  public constructor(
    private _apiService: McsApiService,
    private _translateService: TranslateService,
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
        this.retrieveOptions();
        break;

      case 'resource-change':
        this._reset();
        this._resource = params.value as McsResource;
        this.retrieveOptions();
        this._updateValidators();
        break;

      case 'network-vlan-change':
        if(this._hasNetworkValueUpdates(params.value)) {
          this._reset();
          if (!params.value.isNetworkExisting) {
            this.isNetworkExisting = false;
          }
          else {
            this._network = params.value.network as McsNetworkDbNetwork;
            this.isNetworkExisting = true;
          }
          this._updateValidators();
        }
        break;
    }
  }

  public prefixChange() {
    if (this.prefixLength < this.config.prefixValidators.min) {
      this.prefixError = true;
      this.prefixHint = this._translateService.instant('message.validationMin') + this.config.prefixValidators.min;
    }
    else if (this.prefixLength > this.config.prefixValidators.max) {
      this.prefixError = true;
      this.prefixHint = this._translateService.instant('message.validationMax') + this.config.prefixValidators.max;
    }
    else {
      this.prefixError = false;
      this.prefixHint = '';
      this.valueChange(this.config.value);
    }
  }

  private _reset(): void {
    this.config.validators.required = true;
    this.prefixError = false;
    this.prefixHint = '';
    this.prefixLength = defaultPrefixLength;
    this.config.value = "";
    this.valueChange(this.config.value);
  }

  private _updateValidators() {
    if (!this.isInputVisible) {
      this.config.validators.required = false;
      this.hasError = false;
      this.prefixDisabled = false;

      this.config.value = null;
      this.valueChange(this.config.value);
    }
    this._updatePrefixValidators();
    this._configureValidators();
  }

  private _updatePrefixValidators() {
    this.prefixDisabled = isNullOrEmpty(this._resource);
    this.config.prefixValidators.min = this._resource?.isSelfManaged ? prefixMinSelfManaged : prefixMinManaged;
    this.prefixLength = defaultPrefixLength;
  }

  private _configureValidators() {
    this.config.gatewayValidator = this._gatewayValidator.bind(this);
  }

  public get reserveNewSubnetOptionText(): string{
    return this._translateService.instant('action.reserveNewSubnet')
  }

  private _gatewayValidator(gatewayIp: any): boolean {
    // Don't allow Self Managed VDCs to reserve a new Subnet
    if (gatewayIp == this.reserveNewSubnetOptionText) {
      return !this.isResourceSelfManaged;
    }
    // If the gateway IP field isn't visble it's valid
    if (!this.isInputVisible) {
      return true;
    }
    try {
      let subnet = new Netmask(`${gatewayIp}/${this.prefixLength}`);

      // Gateway IP should not be base or broadcast
      if (gatewayIp === subnet.base || gatewayIp === subnet.broadcast) {
        return false;
      }
      // Otherwise the IP is valid
      return true;
    } catch (error) {
      // If the gateway_IP + prefix_length do not form a valid network, then it's invalid
      return false;
    }
  }

  private _hasNetworkValueUpdates(paramsValue: any): boolean{
    return !(this.isNetworkExisting === paramsValue?.isNetworkExisting &&
      this._network?.id === paramsValue?.network?.id);
  }

  public get isInputVisible(): boolean {
    if (isNullOrUndefined(this._resource) || isNullOrUndefined(this._network)
        || this._resource.isSelfManaged) { return true }
    return this.isNetworkExisting;
  }

  public get isResourceSelfManaged(): boolean {
    if (isNullOrUndefined(this._resource)) { return false }
    return this._resource.isSelfManaged;
  }

  public setValue(value: string) {
    this.config.value = value;
    this.valueChange(this.config.value);
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
    let option = event.option;
    let prefix = this._getSubnetDetails(option.value);
    this.prefixLength = prefix.prefixLength;
    this.setValue(option.value);
  }

  public getOptionValue(opt: FlatOption) {
    if (isNullOrEmpty(opt)) { return }
    return opt.value;
  }

  protected callService(): Observable<McsNetworkVdcSubnet[]> {
    if (isNullOrEmpty(this._resource) || isNullOrEmpty(this._companyId)) { return of([]); }

    let queryParam = new McsObjectVdcQueryParams();
    queryParam.vdcId = this._resource.id;
    queryParam.networkServiceId = this._serviceId;
    queryParam.companyId = this._companyId;

    return this._apiService.getVdcNetworkPrecheck(queryParam).pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        return response && response.subnets;
      }));
  }

  protected filter(collection: McsNetworkVdcSubnet[]): FlatOption[] {
    let options: FlatOption[] = [];

    collection.forEach((item) => {
      options.push({
        type: 'flat',
        key: item.gatewayIp,
        value: item.gatewayIp + ' - ' + item.description
      });
    });

    return options;
  }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    let data = this._setNetworkVdcSubnetData(value);

    this.dataChange.emit({
      value: data,
      eventName,
      dependents
    });
  }

  private _setNetworkVdcSubnetData(value: any): McsNetworkVdcSubnet {
    let subnet = this._getSubnetDetails(value);

    let gatewayIpValue = isNullOrEmpty(subnet?.gatewayIp) ? value : subnet.gatewayIp;
    let prefixLengthValue = (isNullOrEmpty(subnet?.prefixLength) || subnet?.prefixLength !== this.prefixLength) ? this.prefixLength : subnet.prefixLength;
    let descriptionValue = isNullOrEmpty(subnet?.description) ? '' : subnet.description;
    let data: McsNetworkVdcSubnet = {
      gatewayIp: gatewayIpValue,
      prefixLength: prefixLengthValue,
      description: descriptionValue
    }

    return data;
  }

  private _getSubnetDetails(value: string): McsNetworkVdcSubnet {
    return this.collection?.find((item) => item.gatewayIp === value);
  }
}
