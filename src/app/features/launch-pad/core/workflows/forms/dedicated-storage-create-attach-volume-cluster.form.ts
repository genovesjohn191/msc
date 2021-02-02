import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectChipsVmField,
  DynamicSelectField,
  DynamicSlideToggleField
} from '@app/features-shared/dynamic-form';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';

export const dedicatedStorageCreateAndAttachVolumeClusterForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['servers'],
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
      key: 'boot',
      label: 'Boot'
    }),
    new DynamicSelectChipsVmField({
      key: 'servers',
      label: 'Servers',
      placeholder: 'Search for name or service ID...',
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
  // TODO: CRISP Mapping for IC2_DISK_SPACE,IC2_STORAGE_TIER,DESIGNATED_USAGE,IC2_SERVER
}
