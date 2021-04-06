import {
  DynamicInputHiddenField,
  DynamicSelectField,
  DynamicSelectVmField
} from '@app/features-shared/dynamic-form';
import {
  McsObjectCrispElementServiceAttribute,
  PlatformType,
  ServiceType
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const microsoftCreateSubscriptionForm: LaunchPadForm = {
  config: [
    new DynamicSelectVmField({
      key: 'server',
      label: 'Target Server',
      validators: { required: true },
      useServiceIdAsKey: true
    }),
    new DynamicSelectField({
      key: 'availabilityZone',
      label: 'Availability Zone',
      validators: { required: true },
      options: [
        { key: 'Global', value: 'Global'},
        { key: 'AZ1', value: 'AZ1'}
      ]
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'tenant',
      value: findCrispElementAttribute(CrispAttributeNames.LinkedMsTenant, attributes)?.displayValue } );

    return mappedProperties;
  }
}
