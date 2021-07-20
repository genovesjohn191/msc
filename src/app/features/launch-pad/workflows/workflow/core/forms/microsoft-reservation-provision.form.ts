import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicInputTextField,
  DynamicSelectAzureSubscriptionField,
  DynamicSelectField,
  DynamicSelectSoftwareSubscriptionProductTypeField,
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
      dependents: ['subscription'],
    }),
    new DynamicInputHiddenField({
      key: 'skuId',
      value: '',
      eventName: 'sku-id-change',
      dependents: ['catalogItem'],
    }),
    new DynamicInputHiddenField({
      key: 'productId',
      value: '',
      eventName: 'microsoft-product-id-change',
      dependents: ['catalogItem'],
    }),
    new DynamicInputTextField({
      key: 'tenant',
      label: 'Tenant',
      placeholder: 'Enter tenant name',
      settings: { readonly: true },
    }),
    new DynamicInputHiddenField({
      key: 'linkedService',
      value: '',
      eventName: 'linked-service-id-change',
      dependents: ['subscription'],
    }),
    new DynamicSelectAzureSubscriptionField({
      key: 'subscription',
      label: 'Subscription',
      validators: { required: true },
      settings: { readonly: true },
      useSubscriptionIdAsKey: true
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
      settings: { readonly: true },
      options: [
        { key: '1', value: '1 Year'},
        { key: '3', value: '3 Years'}
      ]
    }),
    new DynamicSelectField({
      key: 'billingCycle',
      label: 'Billing Cycle',
      validators: { required: true },
      options: [
        { key: 'one_time', value: 'One-Time'},
        { key: 'monthly', value: 'Monthly'}
      ]
    }),
    new DynamicSelectSoftwareSubscriptionProductTypeField({
      key: 'catalogItem',
      label: 'Instance Type',
      validators: { required: true },
      settings: { readonly: true },
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'skuId',
    value: findCrispElementAttribute(CrispAttributeNames.SkuId, attributes)?.value } );

    mappedProperties.push({ key: 'productId',
    value: findCrispElementAttribute(CrispAttributeNames.ProductId, attributes)?.value } );

    mappedProperties.push({ key: 'tenant',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    mappedProperties.push({ key: 'linkedService',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedConsService, attributes)?.displayValue } );

    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    mappedProperties.push({ key: 'term',
    value: findCrispElementAttribute(CrispAttributeNames.ReservedTerm, attributes)?.value } );

    let billingFrequencyCrispValue = findCrispElementAttribute(CrispAttributeNames.BillFreq, attributes)?.value;
    if (!isNullOrEmpty(billingFrequencyCrispValue)) {
      let billingCycle: string = '';
      switch (billingFrequencyCrispValue.toString().toLowerCase()) {
        case 'yearly': {
          billingCycle = 'one_time';
          break;
        }

        case 'mopnthly': {
          billingCycle = 'mopnthly';
          break;
        }
      }

      mappedProperties.push({ key: 'billingCycle', value: billingCycle } );
    }

    return mappedProperties;
  }
}
