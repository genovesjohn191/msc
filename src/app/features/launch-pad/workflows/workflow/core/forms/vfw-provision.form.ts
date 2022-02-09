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
      dependents: ['secondaryServiceId']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
    }),
    new DynamicSelectVdcField({
      key: 'vdc',
      label: 'VDC',
      contextualHelp: 'The VDC this firewall is provisioned in. For stretched VDCs, please speak to a specialist.',
      eventName: 'resource-change',
      validators: { required: true },
      settings: { preserve: true },
      useServiceIdAsKey: true,
      disableStretched: true
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
    }),
    new DynamicInputPasswordField({
      key: 'password',
      label: 'Password',
      placeholder: 'Password',
      contextualHelp: 'The password to configure on the firewall.',
      validators: { required: true }
    }),
    new DynamicVrfNameField({
      key: 'primaryManagementVrf',
      label: 'Primary Management VRF',
      placeholder: 'Primary Management VRF',
      contextualHelp: 'The name of the primary management VRF to configure on the firewall.'
    }),
    new DynamicInputHostNameField({
      key: 'primaryHostname',
      label: 'Primary Hostname',
      placeholder: 'Primary Management VRF',
      contextualHelp: 'The primary hostname to configure on the firewall.',
      validators: { required: true }
    }),
    new DynamicSelectFortiManagerField({
      key: 'fortiManager',
      label: 'FortiManager',
      contextualHelp: 'The FortiManager instance to provision the ADOM on.'
    }),
    new DynamicSelectFortiAnalyzerField({
      key: 'fortiAnalyzer',
      label: 'FortiAnalyzer',
      contextualHelp: 'The FortiAnalyzer instance to provision the ADOM on.'
    }),
    new DynamicInputAdomNameField({
      key: 'adomName',
      label: 'ADOM Name',
      placeholder: 'ADOM Name',
      validators: { required: true, maxlength: 35 },
      contextualHelp: 'The name of the ADOM to provision.'
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
