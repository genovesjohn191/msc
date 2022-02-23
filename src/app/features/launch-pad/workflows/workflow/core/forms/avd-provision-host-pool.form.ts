
import {
  DynamicInputAccountUpnField,
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicInputOuPathField,
  DynamicInputPasswordField,
  DynamicInputProfileStorageAccountNameField,
  DynamicInputShortCustomerNameField,
  DynamicInputSubscriptionIdField,
  DynamicInputTextField,
  DynamicSelectAzureResourceField,
  DynamicSelectField,
  DynamicSelectLocationField,
  DynamicSelectResourceGroupField,
  DynamicSelectVmSizeField,
  DynamicSlideToggleField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const provisionAvdHostPoolForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: [
        'customerShortName',
        'subscriptionId',
        'avdResourceGroup',
        'vnetResourceGroup',
        'vnet',
        'subnet',
        'domainControllerResourceGroup',
        'domainControllerVM',
        'location',
        'vmSize'
      ],
    }),
    new DynamicInputHiddenField({
      key: 'linkedService',
      value: '',
      eventName: 'linked-service-id-change',
      dependents: ['subscriptionId'],
    }),
    new DynamicInputSubscriptionIdField({
      key: 'subscriptionId',
      label: 'Subscription ID',
      placeholder: 'Enter subscription ID',
      contextualHelp: 'The subscription ID to use for this operation.',
      settings: { readonly: true, preserve: true },
      validators: { required: true }
    }),
    new DynamicInputShortCustomerNameField({
      key: 'customerShortName',
      label: 'Short Customer Name',
      placeholder: 'Enter a short customer name',
      contextualHelp: 'Specify a short customer name (alphanumeric, 13 characters max). This will be used to name any resources that are created during provisioning.',
      validators: { required: true, maxlength: 13 },
      useCompanyName: true
    }),
    new DynamicSelectLocationField({
      key: 'location',
      label: 'Location',
      contextualHelp: 'Region where AVD is deployed.',
      validators: { required: true }
    }),
    new DynamicSelectResourceGroupField({
      key: 'avdResourceGroup',
      label: 'AVD Resource Group',
      contextualHelp: 'The resource group containing the existing AVD service.',
      validators: { required: true },
      resourceType: 'microsoft.resources/subscriptions/resourcegroups',
      useAzureIdAsKey: true
    }),
    new DynamicSelectResourceGroupField({
      key: 'vnetResourceGroup',
      label: 'VNET Resource Group',
      contextualHelp: 'The resource group containing the existing virtual network.',
      validators: { required: true },
      resourceType: 'microsoft.resources/subscriptions/resourcegroups',
      eventName: 'vnet-resource-change',
      dependents: ['vnet', 'subnet'],
    }),
    new DynamicSelectAzureResourceField({
      key: 'vnet',
      label: 'VNET',
      contextualHelp: 'The virtual network that VMs will be connected to.',
      validators: { required: true },
      resourceType: 'microsoft.network/virtualnetworks',
      useNameAsKey: false
    }),
    new DynamicSelectAzureResourceField({
      key: 'subnet',
      label: 'Subnet',
      contextualHelp: 'The subnet that VMs will be placed in.',
      validators: { required: true },
      resourceType: 'microsoft.network/subnets',
      useNameAsKey: true
    }),
    new DynamicSelectResourceGroupField({
      key: 'domainControllerResourceGroup',
      label: 'Domain Controller Resource Group',
      contextualHelp: 'The resource group containing the VM which has the domain controller on it.',
      validators: { required: true },
      resourceType: 'microsoft.resources/subscriptions/resourcegroups',
      eventName: 'domain-controller-change',
      dependents: ['domainControllerVM'],
    }),
    new DynamicSelectAzureResourceField({
      key: 'domainControllerVM',
      label: 'Domain Controller VM',
      contextualHelp: 'The VM with the domain controller on it.',
      validators: { required: true },
      resourceType: 'microsoft.Compute/virtualMachines',
      useNameAsKey: false
    }),
    new DynamicInputAccountUpnField({
      key: 'azureAdminAccountUPN',
      label: 'Azure Admin Account UPN',
      placeholder: 'Enter azure admin account UPN',
      contextualHelp: 'Local Azure AD account with Global Administrator AAD role and Owner role on the specified subscription. Accounts with MFA enforced are not supported.',
      validators: { required: true, maxlength: 1024 }
    }),
    new DynamicInputPasswordField({
      key: 'azureAdminPassword',
      label: 'Azure Admin Password',
      placeholder: 'Enter azure admin password',
      contextualHelp: 'The password for the specified Azure admin account UPN.',
      validators: { required: true }
    }),
    new DynamicInputAccountUpnField({
      key: 'domainJoinAccountUPN',
      label: 'Domain Join Account UPN',
      placeholder: 'Enter domain join account UPN',
      contextualHelp: 'User or service account UPN with sufficient privileges to domain join virtual machines.',
      validators: { required: true, maxlength: 1024 }
    }),
    new DynamicInputPasswordField({
      key: 'domainJoinPassword',
      label: 'Domain Join Password',
      placeholder: 'Enter domain join password',
      contextualHelp: 'The password for the specified domain join account UPN.',
      validators: { required: true }
    }),
    new DynamicInputOuPathField({
      key: 'ouPath',
      label: 'OU Path',
      value: '',
      placeholder: 'Enter OU Path',
      contextualHelp: 'The Organizational Unit the host pool VMs will join. E.g. OU=orgunit,DC=domain,DC=com,dc=au.',
      validators: { required: false }
    }),
    new DynamicInputTextField({
      key: 'avdUserGroup',
      label: 'AVD User Group',
      placeholder: 'Enter AVD user group',
      contextualHelp: 'An existing Windows AD domain Security Group for AVD users. This security group will be granted access to login to the AVD host pool. The Windows Security Group should automatically sync via AD Connect to AAD.',
      validators: { required: true }
    }),
    new DynamicInputTextField({
      key: 'hostPoolName',
      label: 'Host Pool Name',
      placeholder: 'Enter host pool name',
      contextualHelp: 'The name of the Host Pool that will be created.',
      validators: { required: true }
    }),
    new DynamicInputTextField({
      key: 'vmNamePrefix',
      label: 'VM Name Prefix',
      placeholder: 'Enter VM name prefix',
      contextualHelp: 'Prefix to use for each VM\'s name in the host pool.',
      validators: { required: true, maxlength: 13 }
    }),
    new DynamicSelectVmSizeField({
      key: 'vmSize',
      label: 'VM Size',
      contextualHelp: 'Size of the VM to be provisioned.',
      validators: { required: true }
    }),
    new DynamicInputNumberField({
      key: 'vmInitialNumber',
      label: 'VM Initial Number',
      placeholder: 'Enter VM initial number',
      contextualHelp: 'Numbered suffix to use for the first VM. This number will be incremented for each VM required.',
      validators: { required: true, min: 0, max: 99999 },
      hint: 'Allowed value is 0 - 99999',
    }),
    new DynamicInputNumberField({
      key: 'vmQuantity',
      label: 'VM Quantity',
      placeholder: 'Enter VM quantity',
      contextualHelp: 'Quantity of VMs to add.',
      validators: { required: true, min: 1, max: 99999 },
      hint: 'Allowed value is 1 - 99999',
    }),
    new DynamicSlideToggleField({
      key: 'useAvailabilityZone',
      label: 'Spread Across Availability Zones',
      contextualHelp: 'Whether to spread VMs in this host pool across multiple availability zones (only supported for some locations).',
      value: false
    }),
    new DynamicInputProfileStorageAccountNameField({
      key: 'profilesStorageAccountName',
      label: 'Profiles Storage Account Name',
      placeholder: 'Enter profile storage account name',
      contextualHelp: 'Name of the Azure Premium Files storage account used for FSLogix profiles.',
      validators: { required: true, maxlength: 15 }
    }),
    new DynamicInputNumberField({
      key: 'profilesStorageShareQuotaGB',
      label: 'Profiles Storage Share Quota (GB)',
      placeholder: 'Enter profile storage share quota',
      contextualHelp: 'Quota for Azure Premium Files share, in GB.',
      validators: { required: true, min: 1, max: 99999 },
      suffix: 'GB',
      hint: 'Allowed value is 1 - 99999',
      }),
    new DynamicInputTextField({
      key: 'sharedImageGalleryName',
      label: 'Shared Image Gallery Name',
      placeholder: 'Enter shared image gallery name',
      contextualHelp: 'Shared image gallery to store the customer\'s AVD image in.',
      validators: { required: true }
    }),
    new DynamicSelectField({
      key: 'vmImageName',
      label: 'VM Image',
      contextualHelp: 'The image to be used.',
      validators: { required: true },
      options: [
        { key: 'avd-win10-21h1-images', value: 'Windows 10 multisession'},
        { key: 'avd-win10-21h1-o365-images', value: 'Windows 10 multisession with Office 365'}
      ]
    }),
    new DynamicInputTextField({
      key: 'goldVMName',
      label: 'Gold VM',
      placeholder: 'Enter gold VM name',
      contextualHelp: 'Name of the gold VM to be provisioned.',
      validators: { required: true, maxlength: 15 }
    }),
  ],

  mapContext: standardContextMapper,

  mapCrispElementAttributes: (attributes: McsObjectCrispElementServiceAttribute[]) => {
    let mappedProperties: { key: string, value: any }[] = [];
    if (isNullOrEmpty(attributes)) { return mappedProperties; }

    mappedProperties.push({ key: 'linkedService',
      value: findCrispElementAttribute(CrispAttributeNames.AvdCspConsSrvc, attributes)?.displayValue } );

    return mappedProperties;
  }
}