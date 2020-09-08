export interface DynamicFormFieldData {
  type: DynamicFormFieldType;
  template: DynamicFormFieldTemplate;
  key: string;
  label: string;
  placeholder: string;
  options?: FlatOption[] | GroupedOption[];
  pattern?: any;
  hint?: string;
  order?: number;
  validators?: DynamicFormControlValidator;
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

export interface DynamicFormFieldDataChange {
  value?: any;
  onChangeEvent?: DynamicFormFieldOnChangeEvent;
  dependents?: string[];
}

export type DynamicFormFieldType =
  'textbox-domain'
  | 'textbox-host-name'
  | 'textbox-input'
  | 'textbox-ip'
  | 'textbox-number'
  | 'textbox-random'
  | 'select'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-os'
  | 'select-storage-profile'
  | 'select-vdc';

export type DynamicFormFieldTemplate =
  'input-text'
  | 'input-number'
  | 'input-random'
  | 'select'
  | 'select-group'
  | 'select-multiple'
  | 'select-network'
  | 'select-os'
  | 'select-storage-profile'
  | 'select-vdc';

export type DynamicFormFieldOnChangeEvent =
  ''
  | 'az-change'
  | 'resource-change';

export type DynamicFormFieldInputType =
  ''
  | 'text'
  | 'number'
  | 'tel'
  | 'email'
  | 'password'
  | 'number'
  | 'url';
