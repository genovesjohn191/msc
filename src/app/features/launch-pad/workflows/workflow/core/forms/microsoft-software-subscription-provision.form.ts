import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectChipsSoftwareSubscriptionProductTypeField,
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
    new DynamicInputHiddenField({
      key: 'skuId',
      value: '',
      eventName: 'subscription-sku-id-change',
      dependents: ['product'],
    }),
    new DynamicInputHiddenField({
      key: 'productId',
      value: '',
      eventName: 'subscription-product-id-change',
      dependents: ['product'],
    }),
    new DynamicSelectTenantField({
      key: 'tenant',
      label: 'Tenant',
      validators: { required: true },
      useTenantIdAsKey: true,
      eventName: 'tenant-change',
      dependents: ['subscription']
    }),
    new DynamicInputNumberField({
      key: 'quantity',
      label: 'Quantity',
      placeholder: 'Enter quantity',
      validators: { required: true, min: 1, max: 9999},
      hint: 'Allowed value is 1 - 9999'
    }),
    new DynamicSelectChipsSoftwareSubscriptionProductTypeField({
      key: 'product',
      label: 'Product',
      placeholder: 'Search for name, SKU or product ID...',
      validators: { required: true },
      settings: { readonly: true },
      allowCustomInput: false,
      maxItems: 1
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

    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    return mappedProperties;
  }
}
