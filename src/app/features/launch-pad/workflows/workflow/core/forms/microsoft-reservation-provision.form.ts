import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectAvailabilityZoneField,
  DynamicSelectAzureSubscriptionField,
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

export const microsoftReservationProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['tenant', 'subscription'],
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
      useSubscriptionIdAsKey: true
    }),
    new DynamicSelectAvailabilityZoneField({
      key: 'availabilityZone',
      label: 'Availability Zone',
      validators: { required: true }
    }),
    new DynamicInputNumberField({
      key: 'diskSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, min: 1, max: 99999  },
      hint: 'Allowed value is 1 - 99999 ',
      suffix: 'GB'
    }),
    new DynamicInputNumberField({
      key: 'ramInGB',
      label: 'RAM',
      placeholder: 'Enter RAM size',
      validators: { required: true, min: 1, max: 99999  },
      hint: 'Allowed value is 1 - 99999 ',
      suffix: 'GB'
    }),
    new DynamicInputNumberField({
      key: 'vCpu',
      label: 'vCPU',
      placeholder: 'Enter vCPU count',
      validators: { required: true, min: 1, max: 99999  },
      hint: 'Allowed value is 1 - 99999 ',
      suffix: 'vCPU'
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
        { key: '1Y', value: '1 Year'},
        { key: '3Y', value: '1 Years'}
      ]
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    console.log('tenant', findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes));
    mappedProperties.push({ key: 'tenant',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    console.log('subscription', findCrispElementAttribute(CrispAttributeNames.LinkedConsService, attributes));
    mappedProperties.push({ key: 'subscription',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedConsService, attributes)?.displayValue } );

    console.log('instanceType', findCrispElementAttribute(CrispAttributeNames.ProductId, attributes));
    mappedProperties.push({ key: 'instanceType',
    value: findCrispElementAttribute(CrispAttributeNames.ProductId, attributes)?.displayValue } );

    console.log('quantity', findCrispElementAttribute(CrispAttributeNames.Quantity, attributes));
    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    console.log('term', findCrispElementAttribute(CrispAttributeNames.ReservedTerm, attributes));
    mappedProperties.push({ key: 'term',
    value: findCrispElementAttribute(CrispAttributeNames.ReservedTerm, attributes)?.displayValue } );

    mappedProperties.push({ key: 'location', value: 'Global' } );

    return mappedProperties;
  }
}
