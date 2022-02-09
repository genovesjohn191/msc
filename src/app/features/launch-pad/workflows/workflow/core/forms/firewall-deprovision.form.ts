import {
  DynamicInputHiddenField,
  DynamicSelectServiceField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute, ProductType } from '@app/models';
import {
  CommonDefinition,
  isNullOrEmpty
} from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const firewallDeprovisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['secondaryServiceId']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
    }),
    new DynamicSelectServiceField({
      key: 'secondaryServiceId',
      label: 'Secondary Service ID',
      contextualHelp: 'The secondary service ID to pair the firewall with.',
      allowCustomInput: true,
      validators: { required: true, pattern: CommonDefinition.REGEX_FIREWALL_SERVICE_ID_PATTERN },
      productType: ProductType.FirewallDedicated
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let serviceId = findCrispElementAttribute(CrispAttributeNames.Ic2Version, attributes);
    mappedProperties.push({
          key: 'secondaryServiceId',
          value: serviceId
        });

    return mappedProperties;
  }
}
