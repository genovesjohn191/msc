import {
  DynamicInputHiddenField,
  DynamicSelectField,
  DynamicSelectServiceField
} from '@app/features-shared/dynamic-form';
import {
  McsObjectCrispElementService,
  McsObjectCrispElementServiceAttribute,
  ProductType
}
from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const firewallAllocateForm: LaunchPadForm = {
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
      value: '',
      contextualHelp: 'The secondary service ID to pair the firewall with.',
      allowCustomInput: true,
      validators: { required: true, productTypePattern: ProductType.FirewallDedicated},
      productType: ProductType.FirewallDedicated
    }),
    new DynamicSelectField({
      key: 'firewallLevel',
      label: 'Firewall Level',
      options: [
        {key: 10, value: '10 (100E, 100F)'},
        {key: 20, value: '20 (200E, 200F)'},
        {key: 30, value: '30 (500E, 600E)'},
        {key: 40, value: '40 (1100E)'},
        {key: 50, value: '50 ("50")'}
        ],
      validators: { required: true },
      contextualHelp: 'The level of the desired firewall license. This depends on the firewall model being allocated.'
    }),
    new DynamicSelectField({
      key: 'pod',
      label: 'POD',
      options: [
        {key: 'POD1', value: 'POD1'},
        {key: 'POD2', value: 'POD2'},
        {key: 'POD3', value: 'POD3'},
        ],
      validators: { required: true },
      contextualHelp: 'The LAUNCH POD to allocate this firewall in.'
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[], associatedServices: McsObjectCrispElementService[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes) && isNullOrEmpty(associatedServices)) { return mappedProperties; }

    let firewallType = findCrispElementAttribute(CrispAttributeNames.FirewallType, attributes);
    if (!isNullOrUndefined(firewallType)){
      let levelValue: number;
      switch(firewallType.displayValue){
        case 'Level 10':
          levelValue = 10;
          break;
        case 'Level 20':
          levelValue = 20;
          break;
        case 'Level 30':
          levelValue = 30;
          break;
        case 'Level 40':
          levelValue = 40;
          break;
        case 'Level 50':
          levelValue = 50;
          break;
        default:
          levelValue = null;
      }
      mappedProperties.push({
        key: 'firewallLevel',
        value: levelValue
      });
    }

    if(!isNullOrEmpty(associatedServices)){
      let dedicatedFirewallServices = associatedServices
        .filter(svc => svc.productType.toString() === ProductType[ProductType.FirewallDedicated]);

        if(!isNullOrEmpty(dedicatedFirewallServices) && dedicatedFirewallServices.length === 1){
        mappedProperties.push({
          key: 'secondaryServiceId',
          value: dedicatedFirewallServices[0].serviceId
        });
      }
    }

    return mappedProperties;
  }
}
