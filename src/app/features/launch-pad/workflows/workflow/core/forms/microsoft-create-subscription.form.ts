import {
  DynamicInputHiddenField,
  DynamicSelectAvailabilityZoneField,
  DynamicSelectChipsTenantField
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
    new DynamicSelectChipsTenantField({
      key: 'tenant',
      label: 'Tenant',
      placeholder: 'Search for name or tenant ID...',
      validators: { required: true },
      allowCustomInput: true,
      useTenantIdAsKey: true,
      maxItems: 1
    }),
    new DynamicSelectAvailabilityZoneField({
      key: 'location',
      label: 'Location',
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
