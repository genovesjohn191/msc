import { DynamicInputFqdnDomainField, DynamicInputIpField, DynamicSelectField } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from '.';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const addToManagementToolsForm: LaunchPadForm = {
  config: [
    new DynamicInputFqdnDomainField({
      key: 'managementFqdn',
      label: 'Management FQDN',
      placeholder: 'Enter a Management FQDN',
      validators: { required: true },
    }),
    new DynamicInputIpField({
      key: 'ip',
      label: 'IP Address',
      placeholder: 'Enter an IP Address',
      validators: { required: true },
    }),
    new DynamicSelectField({
      key: 'az',
      label: 'Availability Zone',
      validators: { required: true },
      options: [
        { key: 'IC1', value: 'IC 1'},
        { key: 'IC2', value: 'IC 2'},
        { key: 'IC3', value: 'IC 3'},
        { key: 'IC4', value: 'IC 4'},
        { key: 'IC5', value: 'IC 5'},
        { key: 'PH1', value: 'PH 1'},
        { key: 'LB1', value: 'IC 1 (LAB)'}
      ],
    }),
    new DynamicSelectField({
      key: 'osType',
      label: 'OS Type',
      validators: { required: true },
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
    }),
    new DynamicSelectField({
      key: 'deviceType',
      label: 'Device Type',
      validators: { required: true },
      options: [
        { key: 'SE', value: 'SERVER'},
        { key: 'FI', value: 'FIREWALL'},
        { key: 'RO', value: 'ROUTER'},
        { key: 'SW', value: 'SWITCH'},
        { key: 'LO', value: 'LOADBALANCER'},
        { key: 'SA', value: 'SANSWITCH'},
        { key: 'ST', value: 'STORAGEARRAY'},
        { key: 'UC', value: 'UCSFI'},
        { key: 'OT', value: 'OTHER'},
        { key: 'UN', value: 'UNKNOWN'},
      ],
      value: 'SE'
    })
  ],

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    // Operating System
    let linuxOs = findCrispElementAttribute(CrispAttributeNames.LinuxOperatingSystem , attributes)?.value;
    let notLinux = linuxOs && ((linuxOs as string).toLowerCase() === 'not');
    let selectedOs = notLinux ? 'WIN' : 'LIN';
    mappedProperties.push({ key: 'osType', value: selectedOs });

    return mappedProperties;
  }
};

