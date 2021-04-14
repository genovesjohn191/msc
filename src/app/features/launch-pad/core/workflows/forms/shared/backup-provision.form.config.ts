import {
  DynamicFormFieldConfigBase,
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectBatField,
  DynamicSelectField,
  DynamicSelectRetentionPeriodField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';

export const backupProvisionFormConfig: DynamicFormFieldConfigBase[] = [
  new DynamicInputHiddenField({
    key: 'companyId',
    value: '',
    eventName: 'company-change',
    dependents: ['server', 'backupAggregationTarget'],
  }),
  new DynamicSelectVmField({
    key: 'server',
    label: 'Server',
    validators: { required: true },
    useServiceIdAsKey: true,
    dataFilter: {
      hideDedicated: true
    }
  }),
  new DynamicSelectBatField({
    key: 'backupAggregationTarget',
    label: 'Backup Aggregation Target',
    useServiceIdAsKey: true,
    eventName: 'bat-change',
    dependents: ['retentionPeriodInDays'],
  }),
  new DynamicSelectRetentionPeriodField({
    key: 'retentionPeriodInDays',
    label: 'Retention Period',
    validators: { required: true },
  }),
  new DynamicSelectField({
    key: 'dailySchedule',
    label: 'Daily Schedule',
    options: [
      { key: '0 0 * * *', value: '12 AM'},
      { key: '0 1 * * *', value: '1 AM'},
      { key: '0 2 * * *', value: '2 AM'},
      { key: '0 3 * * *', value: '3 AM'},
      { key: '0 4 * * *', value: '4 AM'},
      { key: '0 5 * * *', value: '5 AM'},
      { key: '0 6 * * *', value: '6 AM'},
      { key: '0 7 * * *', value: '7 AM'},
      { key: '0 8 * * *', value: '8 AM'},
      { key: '0 9 * * *', value: '9 AM'},
      { key: '0 10 * * *', value: '10 AM'},
      { key: '0 11 * * *', value: '11 AM'},
      { key: '0 12 * * *', value: '12 PM'},
      { key: '0 13 * * *', value: '1 PM'},
      { key: '0 14 * * *', value: '2 PM'},
      { key: '0 15 * * *', value: '3 PM'},
      { key: '0 16 * * *', value: '4 PM'},
      { key: '0 17 * * *', value: '5 PM'},
      { key: '0 18 * * *', value: '6 PM'},
      { key: '0 19 * * *', value: '7 PM'},
      { key: '0 20 * * *', value: '8 PM'},
      { key: '0 21 * * *', value: '9 PM'},
      { key: '0 22 * * *', value: '10 PM'},
      { key: '0 23 * * *', value: '11 PM'}
    ],
    validators: { required: true },
  }),
  new DynamicInputNumberField({
    key: 'dailyQuotaInGB',
    label: 'Daily Quota',
    placeholder: 'Enter daily backup quota',
    validators: { required: true, min: 1, max: 1000},
    hint: 'Allowed value is 1 - 1000',
    suffix: 'GB'
  }),
];

export const backupProvisionAddOnFormConfig: DynamicFormFieldConfigBase[] = [
  new DynamicInputHiddenField({
    key: 'companyId',
    value: '',
    eventName: 'company-change',
    dependents: ['backupAggregationTarget'],
  }),
  new DynamicSelectBatField({
    key: 'backupAggregationTarget',
    label: 'Backup Aggregation Target',
    useServiceIdAsKey: true,
    eventName: 'bat-change',
    dependents: ['retentionPeriodInDays'],
  }),
  new DynamicSelectRetentionPeriodField({
    key: 'retentionPeriodInDays',
    label: 'Retention Period',
    validators: { required: true },
  }),
  new DynamicSelectField({
    key: 'dailySchedule',
    label: 'Daily Schedule',
    options: [
      { key: '0 0 * * *', value: '12 AM'},
      { key: '0 1 * * *', value: '1 AM'},
      { key: '0 2 * * *', value: '2 AM'},
      { key: '0 3 * * *', value: '3 AM'},
      { key: '0 4 * * *', value: '4 AM'},
      { key: '0 5 * * *', value: '5 AM'},
      { key: '0 6 * * *', value: '6 AM'},
      { key: '0 7 * * *', value: '7 AM'},
      { key: '0 8 * * *', value: '8 AM'},
      { key: '0 9 * * *', value: '9 AM'},
      { key: '0 10 * * *', value: '10 AM'},
      { key: '0 11 * * *', value: '11 AM'},
      { key: '0 12 * * *', value: '12 PM'},
      { key: '0 13 * * *', value: '1 PM'},
      { key: '0 14 * * *', value: '2 PM'},
      { key: '0 15 * * *', value: '3 PM'},
      { key: '0 16 * * *', value: '4 PM'},
      { key: '0 17 * * *', value: '5 PM'},
      { key: '0 18 * * *', value: '6 PM'},
      { key: '0 19 * * *', value: '7 PM'},
      { key: '0 20 * * *', value: '8 PM'},
      { key: '0 21 * * *', value: '9 PM'},
      { key: '0 22 * * *', value: '10 PM'},
      { key: '0 23 * * *', value: '11 PM'}
    ],
    validators: { required: true },
  }),
  new DynamicInputNumberField({
    key: 'dailyQuotaInGB',
    label: 'Daily Quota',
    placeholder: 'Enter daily backup quota',
    validators: { required: true, min: 1, max: 1000},
    hint: 'Allowed value is 1 - 1000',
    suffix: 'GB'
  }),
];