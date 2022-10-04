import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { McsCompute } from '@app/models';
import { convertMbToGb, isNullOrUndefined } from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicInputComputeField } from './input-compute';

@Component({
  selector: 'mcs-dff-input-compute-field',
  templateUrl: './input-compute.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './input-compute.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputComputeComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicInputComputeComponent extends DynamicFieldComponentBase {
  public config: DynamicInputComputeField;
  public compute: McsCompute = {
    model: null,
    numCores: null,
    cpuCount: null,
    cpuMhz: null,
    memoryMB: null,
    processorModel: ''
  }

  public onComputeChange(): void {
    this.config.value = this.compute;
    this.valueChange(this.config.value);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {

      case 'physical-server-change':
        if(isNullOrUndefined(params.value)) { return; }
        this.compute = {
          model: params.value.model,
          cpuCount: params.value.numOfCpus,
          numCores: params.value.numOfCores,
          cpuMhz: params.value.processorSpeedMhz,
          memoryMB: params.value.totalMemory, 
          processorModel: params.value.processorModel
        } as McsCompute;
        this.config.value = this.compute;
        this.valueChange(this.config.value);
        break;
    }
  }

  public get convertedTotalMemoryValue(): number{
    if(isNullOrUndefined(this.compute?.memoryMB)) { return null; }
    return convertMbToGb(this.compute.memoryMB);
  }
}
