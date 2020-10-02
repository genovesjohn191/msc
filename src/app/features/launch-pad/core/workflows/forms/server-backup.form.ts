import {
  DynamicFormFieldDataBase,
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectField
} from '@app/features-shared/dynamic-form';

export const serverBackupForm: DynamicFormFieldDataBase[] = [
  new DynamicSelectField({
    key: 'retention',
    label: 'Backup Retention',
    validators: { required: true },
    options: [
      { key: '7 Days', value: '7 Days'},
      { key: '30 Days', value: '30 Days'}
    ]
  }),
  new DynamicInputNumberField({
    key: 'dailyQuota',
    label: 'Daily Backup Quota',
    placeholder: 'Enter backup size limit',
    validators: { required: true, min: 1, max: 100 },
    hint: 'Allowed value is 1-100',
    suffix: 'GB'
  })
];
