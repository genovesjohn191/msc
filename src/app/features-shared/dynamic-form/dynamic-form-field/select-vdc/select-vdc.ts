import { DynamicFormFieldConfigBase } from '../../dynamic-form-field-config.base';
import {
  DynamicFormFieldOnChangeEvent,
  DynamicFormFieldType,
  DynamicFormFieldTemplate,
  DynamicFormControlSettings
} from '../../dynamic-form-field-config.interface';

export class DynamicSelectVdcField extends DynamicFormFieldConfigBase {
  // Overrides
  public type: DynamicFormFieldType = 'select-vdc';
  public template: DynamicFormFieldTemplate = 'select-vdc';

  public hideSelfManaged?: boolean = false;
  public hideManaged?: boolean = false;
  public useServiceIdAsKey: boolean = false;
  public disableStretched: boolean = false;
  public matchServiceIdInOptions: boolean = false;
  public noVdcForServiceFallback?: string;

  public constructor(options: {
    key: string;
    label: string;
    value?: string;
    hint?: string;
    contextualHelp?: string;
    order?: number;
    eventName?: DynamicFormFieldOnChangeEvent;
    dependents?: string[];
    validators?: { required?: boolean; };
    settings?: DynamicFormControlSettings;
    hideSelfManaged?: boolean;
    hideManaged?: boolean;
    useServiceIdAsKey?: boolean;
    disableStretched?: boolean;
    matchServiceIdInOptions?: boolean;
    noVdcForServiceFallback?: string;
  }) {
    super(options);

    this.hideSelfManaged = options.hideSelfManaged || false;
    this.hideManaged = options.hideManaged || false;
    this.useServiceIdAsKey = options.useServiceIdAsKey || false;
    this.disableStretched = options.disableStretched || false;
    this.matchServiceIdInOptions = options.matchServiceIdInOptions || false;
    this.noVdcForServiceFallback = options.noVdcForServiceFallback;
  }
}
