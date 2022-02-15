
import {
  DynamicInputAccountUpnField,
  DynamicInputHiddenField,
  DynamicInputNumberField,
  DynamicInputPasswordField,
  DynamicInputSubscriptionIdField,
  DynamicSelectResourceGroupField,
} from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { LaunchPadForm } from './form.interface';
import {
  CrispAttributeNames,
  findCrispElementAttribute
} from './mapping-helper';
import { standardContextMapper } from './shared/standard-context-mapper';

export const vmsAvdHostPoolAddForm: LaunchPadForm = {
  config: [
    new DynamicInputHiddenField({
      key: 'companyId',
      value: '',
      eventName: 'company-change',
      dependents: ['customerShortName', 'subscriptionId', 'avdResourceGroup'],
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
    new DynamicSelectResourceGroupField({
      key: 'avdResourceGroup',
      label: 'AVD Resource Group',
      contextualHelp: 'The resource group containing the existing AVD service.',
      validators: { required: true },
      resourceType: 'microsoft.resources/subscriptions/resourcegroups',
      useAzureIdAsKey: true
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