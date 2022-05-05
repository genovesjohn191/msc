import {
  DynamicInputAdomNameField,
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputPasswordField,
  DynamicSelectField,
  DynamicSelectFortiAnalyzerField,
  DynamicSelectFortiManagerField,
  DynamicSelectVdcField,
  DynamicVrfNameField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
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

export const vfwProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['vdc', 'fortiManager', 'fortiAnalyzer']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
    }),
    new DynamicSelectVdcField({
      key: 'vdc',
      label: 'VDC',
      eventName: 'resource-change',
      validators: { required: true },
      settings: { preserve: true },
      disableStretched: true,
      contextualHelp: 'The VDC to configure the firewall in. For stretched VDCs, please speak to a specialist.'
    }),
    new DynamicSelectField({
      key: 'size',
      label: 'Firewall Size',
      options: [
        {key: 'Small', value: 'Small'},
        {key: 'Medium', value: 'Medium'},
        {key: 'Large', value: 'Large'}
        ],
      validators: { required: true },
      contextualHelp: 'The size of the firewall.'
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
      label: 'Management VRF',
      placeholder: 'Management VRF',
      validators: { required: true },
      contextualHelp: 'The name of the management VRF to configure on the firewall.'
    }),
    new DynamicInputHostNameField({
      key: 'primaryHostname',
      label: 'Hostname',
      placeholder: 'Hostname',
      contextualHelp: 'The hostname to configure on the firewall.',
      validators: { required: true }
    }),
    new DynamicSelectFortiManagerField({
      key: 'fortiManager',
      label: 'FortiManager',
      validators: { required: true },
      contextualHelp: 'The FortiManager instance to provision the firewall for.'
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
      contextualHelp: 'The Administrative domain to provision the firewall for. If left blank, this will be based on target company name.'
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    let ic2Version = findCrispElementAttribute(CrispAttributeNames.Ic2Version, attributes);
    if (!isNullOrUndefined(ic2Version)){
      let sizeValue = '';
      switch(ic2Version.displayValue){
        case 'Small - Fortinet':
        case 'Small - F5 APM':
          sizeValue = 'Small';
          break;
        case 'Medium - Fortinet':
        case 'Medium - F5 APM':
          sizeValue = 'Medium';
          break;
        case 'Large - Fortinet':
        case 'Large - F5 APM':
          sizeValue = 'Large';
          break;
        default:
          sizeValue = ic2Version.displayValue;
      }
      mappedProperties.push({
        key: 'size',
        value: sizeValue
      });
    }

    return mappedProperties;
  }
}
