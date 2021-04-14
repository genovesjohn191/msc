import { DynamicInputIpField, DynamicInputTextField, DynamicSelectField, DynamicSlideToggleField } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const updateInManagementToolsForm: LaunchPadForm = {
  config: [
    new DynamicInputIpField({
      key: 'ipAddress',
      label: 'IP Address',
      placeholder: 'Enter an IP address',
      hint: 'IP address is required if no management name is provided'
    }),
    new DynamicInputTextField({
      key: 'managementName',
      label: 'Management Name',
      placeholder: 'Enter management name',
      validators: { maxlength: 200 },
      eventName: 'management-name-change',
      dependents: [ 'ipAddress' ]
    }),
    new DynamicInputTextField({
      key: 'communityString',
      label: 'Community String',
      placeholder: 'Enter community string',
      contextualHelp: 'If the device\'s community string is incorrect in CMDB, enter it here. Please note that this will not update the community string in CMDB; it will merely be used to run this workflow.',
      validators: { maxlength: 2000 },
    }),
    new DynamicSelectField({
      key: 'osType',
      label: 'OS Type',
      options: [
        { key: 'LIN', value: 'LINUX'},
        { key: 'WIN', value: 'WINDOWS'},
        { key: 'ESX', value: 'ESX'},
        { key: 'SOL', value: 'SOLARIS'},
        { key: 'BSD', value: 'BSD'},
        { key: 'JUN', value: 'JUNOS'},
        { key: 'IOS', value: 'IOS'},
        { key: 'IOS-XR', value: 'IOSXR'},
        { key: 'ScreenOS', value: 'ScreenOS'},
        { key: 'ASA', value: 'ASA'},
        { key: 'PIX', value: 'PIX'},
        { key: 'FORTIOS', value: 'FortiOS'},
        { key: 'BIG-IP', value: 'BIGIP'},
        { key: 'TMOS', value: 'TMOS'},
        { key: 'NXOS', value: 'NXOS'},
        { key: 'Foundry', value: 'Foundry'},
        { key: 'NSX', value: 'NSX'},
        { key: 'XIO', value: 'XIO'},
        { key: 'VNX', value: 'VNX'},
        { key: 'VMAX', value: 'VMAX'},
        { key: 'UTY', value: 'UNITY'},
        { key: 'AVU', value: 'AVAMAR'},
        { key: 'UNK', value: 'UNKNOWN'},
        { key: 'UCSM', value: 'UCSM'}
      ],
    contextualHelp: 'If the device\'s OS type is incorrect in CMDB, enter it here. Please note that this will not update the OS type in CMDB; it will merely be used to run this workflow.'
    }),
    new DynamicInputTextField({
      key: 'dnsVisibility',
      label: 'DNS Visibility',
      placeholder: 'Enter DNS visibility',
      contextualHelp: 'If the device\'s DNS visibility is incorrect in CMDB, enter it here. Please note that this will not update the DNS visibility in CMDB; it will merely be used to run this workflow.',
      validators: { maxlength: 2000 },
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    // Operating System
    let linuxOs = findCrispElementAttribute(CrispAttributeNames.Ic2LinLic , attributes)?.value;
    let notLinux = linuxOs && ((linuxOs as string).toLowerCase() === 'not');
    let selectedOs = notLinux ? 'WIN' : 'LIN';
    mappedProperties.push({ key: 'osType', value: selectedOs });

    return mappedProperties;
  }
}
