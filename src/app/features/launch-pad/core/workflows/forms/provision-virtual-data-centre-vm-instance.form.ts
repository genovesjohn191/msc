import {
  DynamicInputHiddenField,
  DynamicInputHostNameField,
  DynamicInputIpField,
  DynamicInputNumberField,
  DynamicSelectField,
  DynamicSelectNetworkField,
  DynamicSelectOsField,
  DynamicSelectStorageProfileField,
  DynamicSelectVdcField
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { WorkflowGroupSaveState } from '../workflow-group.interface';
import { LaunchPadForm } from './form.interface';
import { CrispAttributeNames, findCrispElementAttribute } from './mapping-helper';

export const provisionVirtualDataCentreVmInstanceForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['resource', 'os', 'storage', 'network'],
    }),
    new DynamicInputHiddenField({
      key: 'platform',
      value: 'vcloud'
    }),
    new DynamicSelectVdcField({
      key: 'resource',
      label: 'VDC',
      dependents: ['os', 'storage', 'network'],
      validators: { required: true },
      hint: 'e.g M2VDC270011',
      settings: { preserve: true },
      hideSelfManaged: true
    }),
    new DynamicInputHostNameField({
      key: 'name',
      label: 'Name',
      placeholder: 'Enter a host name',
      validators: { required: true, minlength: 1, maxlength: 100 },
      hint: `e.g. mt-webserver01, mt-db01. '-{service ID}' will be appended to this name in vCloud automatically`
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
      validators: { required: true }
    }),
    new DynamicSelectField({
      key: 'ipAllocationMode',
      label: 'IP Mode',
      options: [
        { key: 'Dhcp', value: 'DHCP'},
        { key: 'Pool', value: 'Pool'},
        { key: 'Manual', value: 'Manual'}
      ],
      value: 'Dhcp',
      eventName: 'ip-mode-change',
      dependents: ['ipAddress'],
      validators: { required: true }
    }),
    new DynamicInputIpField({
      key: 'ipAddress',
      label: 'IP Address',
      placeholder: 'Enter an IP address',
      settings: { hidden: true }
    })
  ],

  mapContext: (context: WorkflowGroupSaveState) => {
    let mappedProperties: { key: string, value: any }[] = [];

    mappedProperties.push({ key: 'companyId', value: context.companyId });

    return mappedProperties;
  },

  // CRISP Element Mapper
  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];

    mappedProperties.push({ key: 'resource', value: findCrispElementAttribute(CrispAttributeNames.Resource , attributes)?.displayValue } );

    // Operating System
    let windowsOs = findCrispElementAttribute(CrispAttributeNames.WindowsOperatingSystem , attributes)?.value;
    let linuxOs = findCrispElementAttribute(CrispAttributeNames.LinuxOperatingSystem , attributes)?.value;
    let selectedOs = ((linuxOs as string).toLowerCase() === 'Not') ? linuxOs : windowsOs;
    mappedProperties.push({ key: 'os', value: selectedOs });
    mappedProperties.push({ key: 'cpuCount', value:findCrispElementAttribute(CrispAttributeNames.CpuCount , attributes)?.value } );
    mappedProperties.push({ key: 'memoryInGB', value: findCrispElementAttribute(CrispAttributeNames.Memory , attributes)?.value } );
    mappedProperties.push({ key: 'storageSizeInGB', value: findCrispElementAttribute(CrispAttributeNames.Storage , attributes)?.value } );

    // IP Address
    let ipAddress = findCrispElementAttribute(CrispAttributeNames.IPAddress , attributes)?.value;
    mappedProperties.push({ key: 'ipAddress', value: ipAddress } );
    mappedProperties.push({ key: 'ipAllocationMode', value: ipAddress ? 'Manual' : 'Dhcp' } );

    return mappedProperties;
  }
}
