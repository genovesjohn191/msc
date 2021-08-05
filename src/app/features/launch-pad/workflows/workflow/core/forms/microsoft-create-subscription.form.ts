import {
  DynamicInputHiddenField,
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
      contextualHelp: 'Select an Azure tenant to create this subscription for.',
      validators: { required: true },
      useTenantIdAsKey: true
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
