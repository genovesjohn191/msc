import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectAzureSubscriptionField,
  DynamicSelectChipsSoftwareSubscriptionProductTypeField,
  DynamicSelectField,
  DynamicSelectTenantField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const microsoftSoftwareSubscriptionProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['tenant'],
    }),
    new DynamicSelectTenantField({
      key: 'tenant',
      label: 'Tenant',
      validators: { required: true },
      useTenantIdAsKey: true,
      eventName: 'tenant-change',
      dependents: ['subscription']
    }),
    new DynamicSelectAzureSubscriptionField({
      key: 'subscription',
      label: 'Subscription',
      validators: { required: true },
      useServiceIdAsKey: true
    }),
    new DynamicSelectChipsSoftwareSubscriptionProductTypeField({
      key: 'product',
      label: 'Product',
      placeholder: 'Search for name, SKU or product ID...',
      validators: { required: true },
      allowCustomInput: false,
      maxItems: 1
    }),
    new DynamicInputNumberField({
      key: 'quantity',
      label: 'Quantity',
      placeholder: 'Enter quantity',
      validators: { required: true, min: 1, max: 9999},
      hint: 'Allowed value is 1 - 9999'
    }),
    new DynamicSelectField({
      key: 'term',
      label: 'Term',
      validators: { required: true },
      options: [
        { key: '1', value: '1 Year'},
        { key: '3', value: '1 Years'}
      ]
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'tenant',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    mappedProperties.push({ key: 'subscription',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedConsService, attributes)?.displayValue } );

    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    mappedProperties.push({ key: 'term',
    value: findCrispElementAttribute(CrispAttributeNames.ReservedTerm, attributes)?.displayValue } );

    return mappedProperties;
  }
}
