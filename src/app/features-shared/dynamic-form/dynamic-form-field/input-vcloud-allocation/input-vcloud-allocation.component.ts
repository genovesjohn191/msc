import {
  Component,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CrispAttributeNames } from '@app/features/launch-pad/workflows/workflow/core/forms/mapping-helper';

import {
  McsVcloudComputeAllocation,
  ProductType
} from '@app/models';
import {
  coerceNumber,
  convertMbToGb,
  isNullOrUndefined
} from '@app/utilities';

import { DynamicFormFieldDataChangeEventParam } from '../../dynamic-form-field-config.interface';
import { DynamicFieldComponentBase } from '../dynamic-field-component.base';
import { DynamicInputVcloudAllocationField } from './input-vcloud-allocation';

@Component({
  selector: 'mcs-dff-input-vcloud-allocation-field',
  templateUrl: './input-vcloud-allocation.component.html',
  styleUrls: ['../dynamic-form-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicInputVcloudAllocationComponent),
      multi: true
    }
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicInputVcloudAllocationComponent extends DynamicFieldComponentBase {
  public config: DynamicInputVcloudAllocationField;
  public compute: McsVcloudComputeAllocation = {
    cpuAllocation: 0,
    memoryAllocationMB: 0
  }

  public showField: boolean = true; 

  public onComputeChange(): void {
    this.config.value = this.compute;
    this.valueChange(this.config.value);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'vcloud-instance-change':
        if(params.value === '') {
          this.showField = false;
          return;
        }

        this.showField = true;
        this.compute = {
          cpuAllocation: this.mapVcpuAllocationCrispElementAttributes() || 0,
          memoryAllocationMB: (this.mapMemoryAllocationMBCrispElementAttributes() * 1024)  || 0,
        } as McsVcloudComputeAllocation;
        this.config.value = this.compute;
        this.valueChange(this.config.value);
        break;
    }
  }

  public get convertedTotalMemoryValue(): number {
    if (isNullOrUndefined(this.compute?.memoryAllocationMB)) { return 0; }
    return convertMbToGb(this.compute.memoryAllocationMB);
  }

  public mapVcpuAllocationCrispElementAttributes(): number {
    if (this.config.crispProductType !== ProductType.FlexVirtualDataCenter) {
      return coerceNumber(this.config.crispElementServiceAttributes?.find(
        (attrib) => attrib.code === CrispAttributeNames.NoVcores)?.value) || 0;
    }
    let vdcCore = coerceNumber(this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.VdcNoVcores)?.value) || 0;
    if (vdcCore !== 0) {
      return vdcCore;
    }
    return coerceNumber(this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.VdcAlwysOnVcore)?.value) || 0;
  }

  public mapMemoryAllocationMBCrispElementAttributes(): number {
    if (this.config.crispProductType !== ProductType.FlexVirtualDataCenter) {
      return coerceNumber(this.config.crispElementServiceAttributes?.find(
        (attrib) => attrib.code === CrispAttributeNames.Ic2Ram)?.value) || 0;
    }
    let vdcRam = coerceNumber(this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.VdcRam)?.value) || 0;
    if (vdcRam !== 0) {
      return vdcRam;
    }
    return coerceNumber(this.config.crispElementServiceAttributes?.find(
      (attrib) => attrib.code === CrispAttributeNames.VdcAlwysOnRam)?.value) || 0;
  }
}
