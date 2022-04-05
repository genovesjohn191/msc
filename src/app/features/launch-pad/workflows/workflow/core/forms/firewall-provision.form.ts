import {
  DynamicInputAdomNameField,
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputPasswordField,
  DynamicSelectField,
  DynamicSelectFortiAnalyzerField,
  DynamicSelectFortiManagerField,
  DynamicSelectServiceField,
  DynamicVrfNameField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementService, McsObjectCrispElementServiceAttribute, ProductType } from '@app/models';
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

export const firewallProvisionForm: LaunchPadForm = {
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
    }),
    new DynamicInputPasswordField({
      key: 'password',
      label: 'Password',
      placeholder: 'Password',
      excludeQuestionMark: true,
      validators: { required: true },
      contextualHelp: 'The password to configure on the firewall.'
    }),
    new DynamicVrfNameField({
      key: 'primaryManagementVrf',
      label: 'Primary Management VRF',
      placeholder: 'Primary Management VRF',
      validators: { required: true },
      contextualHelp: 'The name of the primary management VRF to configure on the firewall.'
    }),
    new DynamicVrfNameField({
      key: 'secondaryManagementVrf',
      label: 'Secondary Management VRF',
      placeholder: 'Secondary Management VRF',
      contextualHelp: 'The name of the secondary management VRF to configure on the firewall.'
    }),
    new DynamicInputHostNameField({
      key: 'primaryHostname',
      label: 'Primary Hostname',
      placeholder: 'Primary Management VRF',
      validators: { required: true },
      contextualHelp: 'The primary hostname to configure on the firewall.'
    }),
    new DynamicInputHostNameField({
      key: 'secondaryHostname',
      label: 'Secondary Hostname',
      placeholder: 'Secondary Management VRF',
      contextualHelp: 'The secondary hostname to configure on the firewall.'
    }),
    new DynamicInputHostNameField({
      key: 'clusterHostname',
      label: 'Cluster Hostname',
      placeholder: 'Cluster Hostname',
      contextualHelp: '	The cluster hostname to configure on the firewall.'
    }),
    new DynamicSelectFortiManagerField({
      key: 'fortiManager',
      label: 'FortiManager',
      validators: { required: true },
      contextualHelp: '	The FortiManager instance to provision the firewall for.'
    }),
    new DynamicSelectFortiAnalyzerField({
      key: 'fortiAnalyzer',
      label: 'FortiAnalyzer',
      validators: { required: true },
      contextualHelp: 'The FortiAnalyzer instance to provision the firewall for.'
    }),
    new DynamicInputAdomNameField({
      key: 'adomName',
      label: 'ADOM Name',
      placeholder: 'ADOM Name',
      validators: { maxlength: 35 },
      contextualHelp: '	The Administrative domain to provision the firewall for. If left blank, this will be based on target company name.'
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
        key: 'level',
        value: levelValue
      });
    }

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
