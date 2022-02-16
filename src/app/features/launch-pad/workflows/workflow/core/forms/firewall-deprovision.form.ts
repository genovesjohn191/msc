import {
  DynamicInputHiddenField,
  DynamicSelectServiceField
} from '@app/features-shared/dynamic-form';
import {
  McsObjectCrispElementService,
  McsObjectCrispElementServiceAttribute,
  ProductType
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
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
      validators: { required: true, productTypePattern: ProductType.FirewallDedicated },
      productType: ProductType.FirewallDedicated
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[], associatedServices: McsObjectCrispElementService[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes) && isNullOrEmpty(associatedServices)) { return mappedProperties; }

    let serviceId = findCrispElementAttribute(CrispAttributeNames.Ic2Version, attributes);
    mappedProperties.push({
      key: 'secondaryServiceId',
      value: serviceId
    });

    if (!isNullOrEmpty(associatedServices)) {
      let dedicatedFirewallServices = associatedServices
        .filter(svc => svc.productType.toString() === ProductType[ProductType.FirewallDedicated]);

      if (!isNullOrEmpty(dedicatedFirewallServices) && dedicatedFirewallServices.length === 1) {
        mappedProperties.push({
          key: 'secondaryServiceId',
          value: dedicatedFirewallServices[0].serviceId
        });
      }
    }

    return mappedProperties;
  }
}
