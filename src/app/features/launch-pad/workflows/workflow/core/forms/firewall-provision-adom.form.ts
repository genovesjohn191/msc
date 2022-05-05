import {
  DynamicInputAdomNameField,
  DynamicInputHiddenField,
  DynamicSelectFortiAnalyzerField,
  DynamicSelectFortiManagerField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { LaunchPadForm } from './form.interface';
import { standardContextMapper } from './shared/standard-context-mapper';

export const firewallProvisionAdomForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['vdc', 'networkId', 'gatewayIp', 'fortiManager', 'fortiAnalyzer']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['gatewayIp', 'networkId']
    }),
    new DynamicSelectFortiManagerField({
      key: 'fortiManager',
      label: 'FortiManager',
      validators: { required: true },
      contextualHelp: 'The FortiManager instance to provision the ADOM on.'
    }),
    new DynamicSelectFortiAnalyzerField({
      key: 'fortiAnalyzer',
      label: 'FortiAnalyzer',
      validators: { required: true },
      contextualHelp: 'The FortiAnalyzer instance to provision the ADOM on.'
    }),
    new DynamicInputAdomNameField({
      key: 'adomName',
      label: 'ADOM Name',
      placeholder: 'ADOM Name',
      validators: { maxlength: 35 },
      contextualHelp: 'The name of the ADOM to provision. If left blank, this will be based on target company name.'
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    return mappedProperties;
  }
}
