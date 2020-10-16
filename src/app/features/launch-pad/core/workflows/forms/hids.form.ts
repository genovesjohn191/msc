import {
  DynamicFormFieldDataBase,
  DynamicInputHiddenField,
  DynamicSelectField
} from '@app/features-shared/dynamic-form';

export const hidsForm: DynamicFormFieldDataBase[] = [
  new DynamicSelectField({
    key: 'mode',
    label: 'Mode',
    validators: { required: true },
    options: [
      { key: 'detect', value: 'Detect'},
      { key: 'protect', value: 'Protect'}
    ],
    settings: { preserve: false }
  })
];
