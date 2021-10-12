import {
  DynamicInputHiddenField,
  DynamicSelectGatewayIpField,
  DynamicSelectNetworkVlanField,
  DynamicSelectVdcField,
  DynamicSlideToggleField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vdcNetworkCreateForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['vdc', 'networkId', 'gatewayIp']
    }),
    new DynamicInputHiddenField({
      key: 'serviceId',
      value: '',
      eventName: 'service-id-change',
      dependents: ['gatewayIp', 'networkId']
    }),
    new DynamicSelectVdcField({
      key: 'vdc',
      label: 'VDC',
      contextualHelp: `Select a VDC to create this network for. If this network relates to a Virtual Firewall, this workflow may need to be run sequentially against both the customer's Managed and Self-Managed VDCs.`,
      eventName: 'resource-change',
      dependents: ['gatewayIp', 'networkId'],
      validators: { required: true },
      settings: { preserve: true }
    }),
    new DynamicSelectNetworkVlanField({
      key: 'networkId',
      label: 'Network',
      contextualHelp: 'Select an existing network to use or enter the name of a new network to be created.',
      eventName: 'network-vlan-change',
      dependents: ['gatewayIp'],
      validators: { required: true },
      vlanVisibility: true,
      allowCustomInput: true
    }),
    new DynamicSelectGatewayIpField({
      key: 'gatewayIp',
      label: 'Gateway IP',
      contextualHelp: 'Select or enter a gateway IP address to use for this network.\n\r Please specify the prefix length to use.',
      eventName: 'gateway-ip-change',
      validators: { required: false },
      prefixValidators: { min: 16, max: 30 },
      dependents: ['prefixLength']
    }),
    new DynamicInputHiddenField({
      key: 'prefixLength'
    }),
    new DynamicSlideToggleField({
      key: 'preview',
      label: 'Preview',
      value: true
    })
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {

    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({
      key: 'vdc',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2Access, attributes)?.displayValue
    });

    // IP Address
    let ipAddress = findCrispElementAttribute(CrispAttributeNames.Ic2Ip, attributes)?.value;
    mappedProperties.push({ key: 'gatewayIp', value: ipAddress });

    return mappedProperties;
  }
}
