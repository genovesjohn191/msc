import {
  DynamicInputHiddenField,
  DynamicSelectChipsVmField
} from '@app/features-shared/dynamic-form';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';

export const dedicatedStorageAttachVolumeClusterForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['servers'],
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
  // TODO: CRISP Mapping for IC2_SERVER
}
