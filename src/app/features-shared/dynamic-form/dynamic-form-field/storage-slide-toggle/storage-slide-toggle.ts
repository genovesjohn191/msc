import { coerceBoolean } from '@app/utilities';
import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicStorageSlideToggleField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'storage-slide-toggle';
  public template: DynamicFormFieldTemplate = 'storage-slide-toggle';
  public value: boolean = false;
  public storagePanelTitle?: string = '';
  public defaultValue?: boolean = false;
  public previewValue?: boolean = false;
  public defaultLabel?: string = '';
  public previewLabel?: string = '';

  public constructor(options: {
    key: string;
    label?: string;
    value?: boolean;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    settings?: DynamicFormControlSettings;
    contextualHelp?: string;
    storagePanelTitle?: string;
    defaultValue?: boolean;
    previewValue?: boolean;
    defaultLabel?: string;
    previewLabel?: string;

  }) {
    super(options);
    this.storagePanelTitle = options.storagePanelTitle;
    this.defaultValue = options.defaultValue || false;
    this.previewValue = options.previewValue || false;
    this.defaultLabel = options.defaultLabel;
    this.previewLabel = options.previewLabel;
    this.value = coerceBoolean(options.value) || false;
  }
}