import {
  DynamicInputHiddenField,
  DynamicInputVcloudAllocationField,
  DynamicSelectProviderVdcField,
  DynamicSelectVcloudInstanceField,
  DynamicSelectVcloudTypeField
} from '@app/features-shared/dynamic-form';
import { DynamicExpansionSlideToggleField } from '@app/features-shared/dynamic-form/dynamic-form-field/expansion-slide-toggle/expansion-slide-toggle';
import { DynamicTableStorageProfileField } from '@app/features-shared/dynamic-form/dynamic-form-field/table-storage-profile/table-storage-profile';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const virtualDataCenterProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['vcloud', 'providerVdc', 'storage']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['vcloud']
    }),
    new DynamicSelectVcloudInstanceField({
      key: 'vcloud',
      label: 'vCloud Instance',
      validators: { required: true },
      vdcAlreadyExistInSameVcloud: 'A VDC with this service ID already exists for this company in the target vCloud instance. The conflicting VDC will be replaced.',
      vdcAlreadyExistInDifferentVcloud: 'A VDC with this service ID already exists for this company in a different vCloud instance.',
      eventName: 'vcloud-instance-change',
      dependents: ['vcloudName', 'providerVdc', 'type', 'compute', 'storage', 'enabled']
    }),
    new DynamicInputHiddenField({
      key: 'vcloudName',
      value: ''
    }),
    new DynamicSelectVcloudTypeField({
      key: 'type',
      label: 'Type',
      validators: { required: true },
      settings: { readonly: true, preserve: true },
      eventName: 'type-change',
      dependents: ['providerVdc'],
      options: [
        { key: 'Standard', value: 'Standard'},
        { key: 'High-Performance', value: 'High-Performance'}
      ]
    }),
    new DynamicSelectProviderVdcField({
      key: 'providerVdc',
      label: 'Provider VDC',
      validators: { required: true },
      eventName: 'provider-vdc-change',
      dependents: ['providerVdcName']
    }),
    new DynamicInputHiddenField({
      key: 'providerVdcName',
      value: ''
    }),
    new DynamicInputVcloudAllocationField({
      key: 'compute',
      label: 'Compute',
      placeholder: '',
      settings: { preserve: true }
    }),
    new DynamicTableStorageProfileField({
      key: 'storage',
      label: 'Storage',
      validators: { required: true },
      settings: { readonly: true }
    }),
    new DynamicExpansionSlideToggleField({
      key: 'enabled',
      label: 'Enable VDC',
      expansionPanelTitle: 'Advanced Options',
      value: true
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
  let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let mappedCrispType = findCrispElementAttribute(CrispAttributeNames.DedicatedProvVdc, attributes)?.value;

    let typeMap: Map<string, string> = new Map([
      ['Standard', 'Standard'],
      ['Dedicated Provider VDC', 'Standard'],
      ['High-Performance VDC', 'High-Performance'],
      ['High-Performance Dedicated Provider VDC', 'High-Performance']
    ]);
    let crispTypeValue = !isNullOrEmpty(mappedCrispType) ? typeMap.get(mappedCrispType.toString()) : 'Standard';
    
    mappedProperties.push({ key: 'type', value: crispTypeValue });
    return mappedProperties;
  }
}
