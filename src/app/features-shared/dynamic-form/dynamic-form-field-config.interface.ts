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
}

export interface DynamicFormControlSettings {
  hidden?: boolean;
  preserve?: boolean;
}

export interface DynamicFormFieldDataChangeEventParam {
  eventName: DynamicFormFieldOnChangeEvent;
  value: any;
  dependents: string[];
}

export type DynamicFormFieldType =
  'textbox-domain'
  | 'textbox-fqdn-domain'
  | 'textbox-hidden'
  | 'textbox-host-name'
  | 'textbox-input'
  | 'textbox-ip'
  | 'textbox-network-db-network-name'
  | 'textbox-number'
  | 'textbox-password'
  | 'textbox-terraform-deployment-name'
  | 'textbox-random'
  | 'select-availability-zone'
  | 'select-bat'
  | 'select-chips'
  | 'select-chips-azure-software-subscription-product-type'
  | 'select-chips-company'
  | 'select-chips-reserved-instance-type'
  | 'select-chips-terraform-module'
  | 'select-chips-terraform-tag'
  | 'select-chips-vm'
  | 'select'
  | 'select-azure-subscription'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-network-db-use-case'
  | 'select-os'
  | 'select-retention-period'
  | 'select-storage-profile'
  | 'select-tenant'
  | 'select-terraform-module-type'
  | 'select-vdc'
  | 'select-vm'
  | 'slide-toggle';

export type DynamicFormFieldTemplate =
  'input-text'
  | 'input-hidden'
  | 'input-ip'
  | 'input-network-db-network-name'
  | 'input-number'
  | 'input-password'
  | 'input-terraform-deployment-name'
  | 'input-random'
  | 'select-availability-zone'
  | 'select-bat'
  | 'select-chips'
  | 'select-chips-company'
  | 'select-chips-azure-software-subscription-product-type'
  | 'select-chips-reserved-instance-type'
  | 'select-chips-terraform-module'
  | 'select-chips-terraform-tag'
  | 'select-chips-vm'
  | 'select'
  | 'select-azure-subscription'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-network-db-use-case'
  | 'select-os'
  | 'select-retention-period'
  | 'select-storage-profile'
  | 'select-tenant'
  | 'select-terraform-module-type'
  | 'select-vdc'
  | 'select-vm'
  | 'slide-toggle';

export type DynamicFormFieldOnChangeEvent =
  ''
  | 'az-change'
  | 'bat-change'
  | 'company-change'
  | 'ip-mode-change'
  | 'management-name-change'
  | 'network-change'
  | 'resource-change'
  | 'subscription-change'
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
