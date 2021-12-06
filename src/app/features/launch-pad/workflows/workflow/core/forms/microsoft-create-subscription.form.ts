import {
  DynamicInputHiddenField,
  DynamicInputShortCustomerNameField,
  DynamicSelectAvailabilityZoneField,
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

export const microsoftCreateSubscriptionForm: LaunchPadForm = {
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
      eventName: 'tenant-change',
      contextualHelp: 'Select an Azure tenant to create this subscription for.',
      validators: { required: true },
      dependents: ['customerShortName'],
      useTenantIdAsKey: true
    }),
    new DynamicInputShortCustomerNameField({
      key: 'customerShortName',
      label: 'Short Customer Name',
      placeholder: 'Enter a short customer name',
      contextualHelp: 'Specify a short customer name (alphanumeric, 16 characters max). This will be used to name any resources that are created during provisioning.',
      validators: { required: true, maxlength: 16 }
    }),
    new DynamicSelectAvailabilityZoneField({
      key: 'location',
      label: 'Location',
      contextualHelp: 'Select an availability zone to create this subscription for. This will be used to set the location of the Log Analytics workspace that will be created. ',
      validators: { required: true }
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'tenant',
      value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    mappedProperties.push({ key: 'location', value: 'Global' } );

    return mappedProperties;
  }
}
