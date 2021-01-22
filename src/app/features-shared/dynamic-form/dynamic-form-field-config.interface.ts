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
  key: string;
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
  | 'textbox-number'
  | 'textbox-password'
  | 'textbox-random'
  | 'select'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-os'
  | 'select-storage-profile'
  | 'select-vdc'
  | 'select-vm'
  | 'slide-toggle';


export type DynamicFormFieldTemplate =
  'input-text'
  | 'input-hidden'
  | 'input-ip'
  | 'input-number'
  | 'input-password'
  | 'input-random'
  | 'select'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-os'
  | 'select-storage-profile'
  | 'select-vdc'
  | 'select-vm'
  | 'slide-toggle';

export type DynamicFormFieldOnChangeEvent =
  ''
  | 'company-change'
  | 'az-change'
  | 'ip-mode-change'
  | 'resource-change'
  | 'network-change'
  | 'service-id-change';

export type DynamicFormFieldInputType =
  ''
  | 'text'
  | 'number'
  | 'tel'
  | 'email'
  | 'password'
  | 'number'
  | 'url';
