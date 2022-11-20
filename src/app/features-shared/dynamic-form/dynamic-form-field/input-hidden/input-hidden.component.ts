import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicInputHiddenField } from './input-hidden';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { McsNetworkVdcSubnet } from '@app/models';

@Component({
  selector: 'mcs-dff-input-hidden-field',
  templateUrl: './input-hidden.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputHiddenComponent),
      multi: true
    }
  ]
})
export class DynamicInputHiddenComponent extends DynamicFieldComponentBase {
  public config: DynamicInputHiddenField;

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'gateway-ip-change':
        let subnet = params.value as McsNetworkVdcSubnet;
        this.config.value = subnet.prefixLength;
        this.valueChange(this.config.value);
        break;
      case 'network-vlan-change':
        let value = params.value;
        if(value.isNetworkNameOverridden || !value.isNetworkExisting){
          this.config.value = value.networkName;
        }
        else {
          this.config.value = null;
        }
        this.valueChange(this.config.value);
        break;
      case 'ucs-change':
        switch(this.config.key){
          case 'domainGroupId':
            this.config.value = params.value?.domainGroupId?? null;
            this.valueChange(this.config.value);
            break;
          case 'platform':
            this.config.value = params.value?.platformType;
            this.valueChange(this.config.value);
            break;
        }
        break;
    }
  }
}
