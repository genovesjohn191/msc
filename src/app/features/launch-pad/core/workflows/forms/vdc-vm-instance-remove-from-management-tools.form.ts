import {
  DynamicInputHiddenField,
  DynamicSelectChipsVmField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

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
    new DynamicSelectChipsVmField({
      key: 'server',
      label: 'Target Virtual Machine',
      placeholder: 'Server',
      validators: { required: false },
      allowDuplicates: true
    })
  ],

  mapContext: standardContextMapper,
}
