import {
  DynamicFormFieldDataBase,
  DynamicInputDomainField,
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputIpField,
  DynamicInputNumberField,
  DynamicInputRandomField,
  DynamicSelectField,
  DynamicSelectNetworkField,
  DynamicSelectOsField,
  DynamicSelectStorageProfileField,
  DynamicSelectVdcField
} from '@app/features-shared/dynamic-form';

export const changeVmForm: DynamicFormFieldDataBase[] = [
  new DynamicSelectField({
    key: 'zone',
    label: 'Availability Zone',
    validators: { required: true },
    options: [
      { key: 'IC1', value: 'IC 1'},
      { key: 'IC2', value: 'IC 2'},
      { key: 'IC4', value: 'IC 4'},
      { key: 'LB1', value: 'IC 1 (LAB)'},
      { key: 'LB2', value: 'IC 2 (LAB)'},
      { key: 'LB4', value: 'IC 4 (LAB)'}
    ],
    eventName: 'az-change',
    dependents: ['vdc'],
    settings: { preserve: true }
  }),
  new DynamicSelectField({
    key: 'pod',
    label: 'POD Name',
    validators: { required: true },
    options: [
      { key: 'POD1', value: 'POD1'},
      { key: 'POD2', value: 'POD2'}
    ],
    value: 'POD1',
    hint: 'POD in Availability Zone',
    settings: { preserve: true }
  }),
  new DynamicSelectField({
    key: 'subZone',
    label: 'Sub Zone',
    validators: { required: false },
    options: [
      { key: 'DMZ', value: 'DMZ'},
      { key: 'Management', value: 'Management'},
      { key: 'Dedicated', value: 'Dedicated'},
      { key: 'vCloud', value: 'vCloud'},
      { key: 'Colocation', value: 'Colocation'}
    ],
    settings: { hidden: true, preserve: true }
  }),
  new DynamicSelectField({
    key: 'vCloudInstance',
    label: 'vCloud Instance',
    options: [
      { key: 'vcloud', value: 'vcloud'},
      { key: 'vcloud101', value: 'vcloud101'},
      { key: 'vcloud202', value: 'vcloud202'},
      { key: 'vcloud4.', value: 'vcloud4'}
    ],
    value: 'vcloud202',
    settings: { preserve: true }
  }),
  new DynamicSelectVdcField({
    key: 'vdc',
    label: 'Org Virtual Data Center',
    dependents: ['os', 'storage', 'network'],
    validators: { required: true },
    hint: 'e.g M2VDC270011',
    settings: { preserve: true }
  }),
  new DynamicSelectStorageProfileField({
    key: 'storage',
    label: 'Storage Profile',
    validators: { required: true },
    settings: { preserve: true }
  }),
  new DynamicSelectNetworkField({
    key: 'network',
    label: 'Network Name',
    validators: { required: true },
    settings: { preserve: true }
  }),
  new DynamicInputHostNameField({
    key: 'hostName',
    label: 'Host Name',
    placeholder: 'Enter a host name',
    validators: { required: true, minlength: 3, maxlength: 15 },
    hint: 'e.g. mt-webserver01, mt-db02'
  }),
  new DynamicInputNumberField({
    key: 'cpu',
    label: 'CPU',
    placeholder: 'Enter number of core',
    validators: { required: true, min: 1, max: 100 },
    hint: 'Allowed value is 1-100',
    suffix: 'vCPU'
  }),
  new DynamicInputNumberField({
    key: 'ram',
    label: 'Memory',
    placeholder: 'Enter vApp memory',
    validators: { required: true, min: 1, max: 2000 },
    hint: 'Allowed value is 1-2000',
    suffix: 'GB'
  }),
  new DynamicInputNumberField({
    key: 'disk',
    label: 'Disk',
    placeholder: 'Enter disk size',
    validators: { required: true, min: 10, max: 100000 },
    hint: 'Allowed value is 10-100000',
    suffix: 'GB'
  })
];
