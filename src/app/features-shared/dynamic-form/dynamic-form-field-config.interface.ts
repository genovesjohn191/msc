import { ValidatorFn } from '@angular/forms';

export interface DynamicFormFieldConfig {
  type: DynamicFormFieldType;
  template: DynamicFormFieldTemplate;
  key: string;
  label: string;
  placeholder: string;
  value?: any;
  options?: FlatOption[] | GroupedOption[];
  pattern?: any;
  hint?: string;
  order?: number;
  validators?: DynamicFormControlValidator;
  settings?: DynamicFormControlSettings;
  eventName?: DynamicFormFieldOnChangeEvent;
  dependents?: string[];
  configureValidators(validators: ValidatorFn[]);
}

export interface FlatOption {
  type?: 'flat';
  key: any;
  value: string;
  disabled?: boolean;
  hint?: string;
}

export interface GroupedOption {
  type?: 'group';
  name: string;
  disabled?: boolean;
  options: FlatOption[];
}

export interface DynamicFormControlValidator {
  required?: boolean;
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
  minSize?: number;
  maxSize?: number;
}

export interface DynamicFormControlSettings {
  hidden?: boolean;
  readonly?: boolean;
  preserve?: boolean;
}

export interface DynamicFormFieldDataChangeEventParam {
  eventName: DynamicFormFieldOnChangeEvent;
  value: any;
  dependents: string[];
}

export type DynamicFormFieldType =
  'textbox-account-upn'
  | 'textbox-adom-name'
  | 'textbox-domain'
  | 'textbox-fqdn-domain'
  | 'textbox-hidden'
  | 'textbox-host-name'
  | 'textbox-input'
  | 'textbox-profile-storage-account-name'
  | 'textbox-ip'
  | 'textbox-network-db-network-name'
  | 'textbox-number'
  | 'textbox-ou-path'
  | 'textbox-password'
  | 'textbox-terraform-deployment-name'
  | 'textbox-random'
  | 'textbox-short-customer-name'
  | 'textbox-size'
  | 'textbox-subscription-id'
  | 'textbox-vrf-name'
  | 'select-availability-zone'
  | 'select-bat'
  | 'select-chip-single-company'
  | 'select-chips'
  | 'select-chips-azure-software-subscription-product-type'
  | 'select-chips-management-domain'
  | 'select-chips-company'
  | 'select-chips-reserved-instance-type'
  | 'select-chips-terraform-module'
  | 'select-chips-terraform-tag'
  | 'select-chips-vm'
  | 'select'
  | 'select-azure-resource'
  | 'select-azure-subscription'
  | 'select-forti-manager'
  | 'select-forti-analyzer'
  | 'select-gateway-ip'
  | 'select-group'
  | 'select-location'
  | 'select-multiple'
  | 'select-multiple-network-db-pods'
  | 'select-network'
  | 'select-network-db-pod'
  | 'select-network-vlan'
  | 'select-network-db-use-case'
  | 'select-os'
  | 'select-retention-period'
  | 'select-software-subscription-product-type'
  | 'select-reservation-product-type'
  | 'select-resource-group'
  | 'select-chips-service'
  | 'select-service'
  | 'select-storage-profile'
  | 'select-tenant'
  | 'select-terraform-module-type'
  | 'select-vdc'
  | 'select-vm'
  | 'select-vm-size'
  | 'slide-toggle';

export type DynamicFormFieldTemplate =
  'input-text'
  | 'input-hidden'
  | 'input-ip'
  | 'input-network-db-network-name'
  | 'input-number'
  | 'input-ou-path'
  | 'input-password'
  | 'input-terraform-deployment-name'
  | 'input-random'
  | 'input-short-customer-name'
  | 'input-size'
  | 'input-subscription-id'
  | 'select-availability-zone'
  | 'select-bat'
  | 'select-chip-single-company'
  | 'select-chips'
  | 'select-chips-company'
  | 'select-chips-azure-software-subscription-product-type'
  | 'select-chips-management-domain'
  | 'select-chips-reserved-instance-type'
  | 'select-chips-service'
  | 'select-chips-terraform-module'
  | 'select-chips-terraform-tag'
  | 'select-chips-vm'
  | 'select'
  | 'select-azure-resource'
  | 'select-azure-subscription'
  | 'select-forti-manager'
  | 'select-forti-analyzer'
  | 'select-gateway-ip'
  | 'select-group'
  | 'select-location'
  | 'select-multiple'
  | 'select-multiple-network-db-pods'
  | 'select-network'
  | 'select-network-vlan'
  | 'select-network-db-pod'
  | 'select-network-db-use-case'
  | 'select-os'
  | 'select-retention-period'
  | 'select-software-subscription-product-type'
  | 'select-reservation-product-type'
  | 'select-resource-group'
  | 'select-service'
  | 'select-storage-profile'
  | 'select-tenant'
  | 'select-terraform-module-type'
  | 'select-vdc'
  | 'select-vm'
  | 'select-vm-size'
  | 'slide-toggle';

export type DynamicFormFieldOnChangeEvent =
  ''
  | 'az-change'
  | 'avd-resource-group-change'
  | 'bat-change'
  | 'company-change'
  | 'gateway-ip-change'
  | 'ip-mode-change'
  | 'linked-service-id-change'
  | 'management-name-change'
  | 'microsoft-product-id-change'
  | 'network-change'
  | 'network-vlan-change'
  | 'resource-change'
  | 'vnet-resource-group-change'
  | 'vnet-change'
  | 'domain-controller-resource-group-change'
  | 'linked-subscription-id-change'
  | 'service-id-change'
  | 'subscription-change'
  | 'sku-id-change'
  | 'subscription-id-change'
  | 'tenant-change'
  | 'terraform-module-type-change'
  | 'terraform-module-change'
  | 'terraform-tag-change';

export type DynamicFormFieldInputType =
  ''
  | 'text'
  | 'number'
  | 'tel'
  | 'email'
  | 'password'
  | 'number'
  | 'url';
