import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicSelectChipsSoftwareSubscriptionProductTypeField,
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
      eventName: 'sku-id-change',
      dependents: ['catalogItem'],
    }),
    new DynamicInputHiddenField({
      key: 'productId',
      value: '',
      eventName: 'microsoft-product-id-change',
      dependents: ['catalogItem'],
    }),
    new DynamicSelectTenantField({
      key: 'tenant',
      label: 'Tenant',
      validators: { required: true },
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
    new DynamicSelectSoftwareSubscriptionProductTypeField({
      key: 'catalogItem',
      label: 'Product',
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

    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    return mappedProperties;
  }
}