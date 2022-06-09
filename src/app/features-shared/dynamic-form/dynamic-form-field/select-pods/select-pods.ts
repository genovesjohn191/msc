import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  FlatOption,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectPodsField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-pods';
  public template: DynamicFormFieldTemplate = 'select-pods';
  public value?: number[];

  public allowDuplicates: boolean = false;
  public options: FlatOption[] = [];
  public allowCustomInput: boolean = false;
  public maxItems: number = 0; // less than 1 is considered infinite
  public multiple?: boolean;
  public hideChips?: boolean;
  public expandFirst?: boolean;
  public selectAllByDefault?: boolean;
  public alwaysShowPanel?: boolean;
  public initialValue?: number[] = [];

  public constructor(options: {
    key: string;
    label: string;
    placeholder: string;
    value?: number[];
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
    allowCustomInput?: boolean;
    maxItems?: number;
    hideChips?: boolean;
    multiple?: boolean;
    expandFirst?: boolean;
    selectAllByDefault?: boolean;
    alwaysShowPanel?: boolean;
    initialValue?: number[];
  }) {
    super(options);

    this.hideChips = options.hideChips || false;
    this.multiple = options.multiple || true;
    this.expandFirst = options.expandFirst || false;
    this.selectAllByDefault = options.selectAllByDefault || false;
    this.alwaysShowPanel = options.alwaysShowPanel || false;
    this.maxItems = options.maxItems || 0;
    this.initialValue = options.initialValue || [];
  }
}
