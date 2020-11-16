import {
  DynamicFormFieldDataBase,
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputIpField,
  DynamicInputNumberField,
  DynamicSelectField,
  DynamicSelectNetworkField,
  DynamicSelectOsField,
  DynamicSelectStorageProfileField,
  DynamicSelectVdcField
} from '@app/features-shared/dynamic-form';

export const newVirtualMachineForm: DynamicFormFieldDataBase[] = [
  new DynamicInputHiddenField({
    key: 'platform',
    value: 'vcloud'
  }),
  new DynamicSelectVdcField({
    key: 'resource',
    label: 'VDC',
    dependents: ['os', 'storage', 'network'],
    validators: { required: true },
    hint: 'e.g M2VDC270011',
    settings: { preserve: true }
  }),
  new DynamicInputHostNameField({
    key: 'name',
    label: 'Name',
    placeholder: 'Enter a host name',
    validators: { required: true, minlength: 1, maxlength: 100 },
    hint: 'e.g. mt-webserver01, mt-db02'
  }),
  new DynamicSelectOsField({
    key: 'os',
    label: 'Operating System',
    validators: { required: true }
  }),
  new DynamicInputNumberField({
    key: 'cpuCount',
    label: 'CPU',
    placeholder: 'Enter number of core',
    validators: { required: true, min: 1, max: 1000 },
    hint: 'Allowed value is 1 - 100',
    suffix: 'vCPU'
  }),
  new DynamicInputNumberField({
    key: 'memoryInGB',
    label: 'RAM',
    placeholder: 'Enter vApp memory',
    validators: { required: true, min: 1, max: 2000},
    hint: 'Allowed value is 1 - 2000',
    suffix: 'GB'
  }),
  new DynamicSelectStorageProfileField({
    key: 'storage',
    label: 'Storage Profile',
    validators: { required: true },
  }),
  new DynamicInputNumberField({
    key: 'storageSizeInGB',
    label: 'Disk Size',
    placeholder: 'Enter disk size',
    validators: { required: true, min: 10, max: 10000 },
    hint: 'Allowed value is 1 - 10000',
    suffix: 'GB'
  }),
  new DynamicSelectNetworkField({
    key: 'network',
    label: 'Network Name',
    validators: { required: true }
  }),
  new DynamicSelectField({
    key: 'ipAllocationMode',
    label: 'IP Mode',
    options: [
      { key: 'Dhcp', value: 'DHCP'},
      { key: 'Pool', value: 'Pool'},
      { key: 'Manual', value: 'Manual'}
    ],
    value: 'Dhcp',
    eventName: 'ip-mode-change',
    dependents: ['ipAddress'],
    validators: { required: true }
  }),
  new DynamicInputIpField({
    key: 'ipAddress',
    label: 'IP Address',
    placeholder: 'Enter an IP address',
    settings: { hidden: true }
  })
];
