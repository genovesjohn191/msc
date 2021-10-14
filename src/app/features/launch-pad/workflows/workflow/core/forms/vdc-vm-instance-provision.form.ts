import {
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputIpField,
  DynamicInputNumberField,
  DynamicSelectField,
  DynamicSelectNetworkField,
  DynamicSelectOsField,
  DynamicSelectStorageProfileField,
  DynamicSelectVdcField,
  DynamicSlideToggleField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vdcVmInstanceProvisionForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['resource', 'os', 'storage', 'network', 'ipAddress'],
    }),
    new DynamicInputHiddenField({
      key: 'platform',
      value: 'vcloud'
    }),
    new DynamicSelectVdcField({
      key: 'resource',
      label: 'VDC',
      eventName: 'resource-change',
      dependents: ['os', 'storage', 'network', 'ipAddress'],
      validators: { required: true },
      settings: { preserve: true },
      hideSelfManaged: true,
      useServiceIdAsKey: true
    }),
    new DynamicInputHostNameField({
      key: 'name',
      label: 'Name',
      placeholder: 'Enter a host name',
      validators: { required: true, minlength: 1, maxlength: 15 },
      hint: 'e.g. mt-webserver01, mt-db01',
      contextualHelp: `'-{service ID}' will be appended to this name in vCloud automatically`
    }),
    new DynamicSelectOsField({
      key: 'os',
      label: 'Operating System',
      validators: { required: true }
    }),
    new DynamicInputNumberField({
      key: 'cpuCount',
      label: 'CPU',
      placeholder: 'Enter number of core',
      validators: { required: true, min: 1, max: 1000 },
      hint: 'Allowed value is 1 - 100',
      suffix: 'vCPU'
    }),
    new DynamicInputNumberField({
      key: 'memoryInGB',
      label: 'RAM',
      placeholder: 'Enter vApp memory',
      validators: { required: true, min: 1, max: 2000},
      hint: 'Allowed value is 1 - 2000',
      suffix: 'GB'
    }),
    new DynamicSelectStorageProfileField({
      key: 'storage',
      label: 'Storage Profile',
      validators: { required: true },
    }),
    new DynamicInputNumberField({
      key: 'storageSizeInGB',
      label: 'Disk Size',
      placeholder: 'Enter disk size',
      validators: { required: true, min: 10, max: 10000 },
      hint: 'Allowed value is 10 - 10000',
      suffix: 'GB'
    }),
    new DynamicSelectNetworkField({
      key: 'network',
      label: 'Network Name',
      eventName: 'network-change',
      dependents: ['ipAddress'],
      validators: { required: true }
    }),
    new DynamicInputIpField({
      key: 'ipAddress',
      label: 'IP Address',
      placeholder: 'Enter an IP address',
      useNetworkRange: true
    }),
    new DynamicSlideToggleField({
      key: 'preserveServerOnError',
      label: 'Preserve Server On Error',
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'resource',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2Access , attributes)?.displayValue } );

    // Operating System
    let windowsOs = findCrispElementAttribute(CrispAttributeNames.Ic2WinLic , attributes)?.value;
    let linuxOs = findCrispElementAttribute(CrispAttributeNames.Ic2LinLic , attributes)?.value;
    let notLinux = linuxOs && ((linuxOs as string).toLowerCase() === 'not');
    let selectedOs = notLinux ? windowsOs: linuxOs;
    mappedProperties.push({ key: 'os', value: selectedOs });

    mappedProperties.push({ key: 'cpuCount',
      value:findCrispElementAttribute(CrispAttributeNames.Ic2Vcpu, attributes)?.value } );

    mappedProperties.push({ key: 'memoryInGB',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2Vram, attributes)?.value } );

    mappedProperties.push({ key: 'storageSizeInGB',
      value: findCrispElementAttribute(CrispAttributeNames.Ic2Storage, attributes)?.value } );

    // IP Address
    let ipAddress = findCrispElementAttribute(CrispAttributeNames.Ic2Ip , attributes)?.value;
    mappedProperties.push({ key: 'ipAddress', value: ipAddress } );

    mappedProperties.push({ key: 'ipAllocationMode', value: ipAddress ? 'Manual' : 'Dhcp' } );

    return mappedProperties;
  }
}
