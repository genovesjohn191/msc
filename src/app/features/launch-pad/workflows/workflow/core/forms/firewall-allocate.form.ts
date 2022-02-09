import {
  DynamicInputHiddenField,
  DynamicSelectField,
  DynamicSelectNetworkDbPodField,
  DynamicSelectServiceField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute, ProductType } from '@app/models';
import {
  CommonDefinition,
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
      contextualHelp: 'The secondary service ID to pair the firewall with.',
      allowCustomInput: true,
      validators: { required: true, pattern: CommonDefinition.REGEX_FIREWALL_SERVICE_ID_PATTERN },
      productType: ProductType.FirewallDedicated
    }),
    new DynamicSelectField({
      key: 'useCase',
      label: 'Use Case',
      options: [
        {key: 'HA', value: 'HA'},
        {key: 'MAZ-AA', value: 'MAZ-AA'}
        ],
      validators: { required: true },
      contextualHelp: 'The intended use case for this firewall allocation. For colo use cases, please speak to a specialist.'
    }),
    new DynamicSelectField({
      key: 'level',
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
    new DynamicSelectNetworkDbPodField({
      key: 'pod',
      label: 'POD',
      validators: { required: true },
      contextualHelp: 'The LAUNCH POD to allocate this firewall in.',
      disableNonLaunch: true
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

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
        key: 'level',
        value: levelValue
      });
    }

    let useCaseValue = findCrispElementAttribute(CrispAttributeNames.UseCase, attributes);
    mappedProperties.push({
      key: 'useCase',
      value: useCaseValue.value
    });
    return mappedProperties;
  }
}
