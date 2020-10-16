import {
  DynamicFormFieldDataBase,
  DynamicSelectField
} from '@app/features-shared/dynamic-form';

export const provisionAvForm: DynamicFormFieldDataBase[] = [
  new DynamicSelectField({
    key: 'av',
    label: 'Type',
    validators: { required: true },
    options: [
      { key: 'standard', value: 'Standard'},
      { key: 'premium', value: 'Premium'}
    ],
    settings: { preserve: true }
  })
];
