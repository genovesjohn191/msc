import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectField,
  DynamicSelectVmField,
  DynamicSlideToggleField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const dedicatedStorageCreateAndAttachVolumeForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['server'],
    }),
    new DynamicSelectField({
      key: 'tier',
      label: 'Storage Tier',
      validators: { required: true },
      options: [
        { key: 'Superior', value: 'Superior'},
        { key: 'Premium2', value: 'Premium 2'},
        { key: 'Performance 8000', value: 'Performance-8000'}
      ]
    }),
    new DynamicInputNumberField({
      key: 'diskSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, min: 1, max: 16384 },
      hint: 'Allowed value is 1 - 16384',
      suffix: 'GB'
    }),
    new DynamicSlideToggleField({
      key: 'bootLun',
      label: 'Boot'
    }),
    new DynamicSelectVmField({
      key: 'server',
      label: 'Server',
      validators: { required: true },
      hideNonDedicated: true,
      allowedHardwareType: [ 'BO', 'LO', 'BL' ]
    })
  ],
  mapContext: (context: WorkflowGroupSaveState) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(context)) { return mappedProperties; }

    mappedProperties.push({ key: 'companyId', value: context.companyId });

    return mappedProperties;
  },
  // TODO: CRISP Mapping for IC2_SERVER
  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'tier', value: findCrispElementAttribute(CrispAttributeNames.StorageTier, attributes)?.value } );
    mappedProperties.push({ key: 'diskSizeInGB', value: findCrispElementAttribute(CrispAttributeNames.DiskSpace, attributes)?.value } );
    let bootLun: boolean = findCrispElementAttribute(CrispAttributeNames.DesignatedUsage, attributes)?.value === 'BOOT';
    mappedProperties.push({ key: 'bootLun', value: bootLun } );
    mappedProperties.push({ key: 'server', value: findCrispElementAttribute(CrispAttributeNames.Server, attributes)?.displayValue } );

    return mappedProperties;
  }
}
