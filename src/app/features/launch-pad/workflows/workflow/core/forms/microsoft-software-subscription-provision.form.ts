import {
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicInputTextField,
  DynamicSelectAzureSubscriptionField,
  DynamicSelectSoftwareSubscriptionProductTypeField,
  DynamicSelectPublicCloudResourceField
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
      dependents: ['subscription','resourceId']
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
      eventName: 'subscription-change',
      dependents: ['resourceId'],
      validators: { required: true },
      settings: { readonly: true },
      useSubscriptionIdAsKey: true
    }),
    new DynamicInputNumberField({
      key: 'quantity',
      label: 'Quantity',
      placeholder: 'Enter quantity',
      validators: { required: true, min: 1, max: 9999},
      settings: { readonly: true },
      hint: 'Allowed value is 1 - 9999'
    }),
    new DynamicSelectSoftwareSubscriptionProductTypeField({
      key: 'catalogItem',
      label: 'Product',
      validators: { required: true },
      settings: { readonly: true },
    }),
    new DynamicSelectPublicCloudResourceField({
      key: 'resourceId',
      label: 'Resource',
      contextualHelp: 'Specify an Azure resource if AHB is desired for this Software Subscription.',
      validators: { required: false },
      resourceTypes: ['microsoft.sqlvirtualmachine/sqlvirtualmachines', 'microsoft.compute/virtualmachines'],
      useAzureIdAsKey: true
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'skuId',
    value: findCrispElementAttribute(CrispAttributeNames.SkuId, attributes)?.value } );

    mappedProperties.push({ key: 'productId',
    value: findCrispElementAttribute(CrispAttributeNames.ProductId, attributes)?.value } );

    let linkedServiceAz = findCrispElementAttribute(CrispAttributeNames.LinkedServiceAz, attributes)?.displayValue;
    let linkedConsService = findCrispElementAttribute(CrispAttributeNames.LinkedConsService, attributes)?.displayValue;
    mappedProperties.push({ key: 'linkedService', value: linkedServiceAz ?? linkedConsService } );

    mappedProperties.push({ key: 'quantity',
    value: findCrispElementAttribute(CrispAttributeNames.Quantity, attributes)?.displayValue } );

    mappedProperties.push({ key: 'tenant',
    value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    return mappedProperties;
  }
}
