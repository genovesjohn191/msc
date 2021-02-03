import {
  DynamicInputHiddenField,
  DynamicSelectChipsField,
  DynamicSelectChipsVmField,
  DynamicSelectVdcField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';

export const vdcVmInstanceRemoveFromManagementToolsForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['id', 'server'],
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['id', 'server'],
    }),
    new DynamicSelectVmField({
      key: 'id',
      label: 'Target Server',
      validators: { required: true },
      settings: { preserve: true },
    }),
    new DynamicSelectChipsField({
      key: 'chips',
      label: 'Sample Chips',
      placeholder: 'Select Chip',
      validators: { required: true },
      options: [
        { key: 'Dhcp', value: 'DHCP'},
        { key: 'Pool', value: 'Pool'},
        { key: 'Manual', value: 'Manual'}
      ],
      allowCustomValue: true
    }),
    new DynamicSelectChipsVmField({
      key: 'server',
      label: 'Target Virtual Machine',
      placeholder: 'Server',
      validators: { required: false },
      allowDuplicates: true
    })
  ],

  mapContext: (context: WorkflowGroupSaveState) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(context)) { return mappedProperties; }

    mappedProperties.push({ key: 'companyId', value: context.companyId });
    mappedProperties.push({ key: 'serviceId', value: context.serviceId });

    return mappedProperties;
  }
}
