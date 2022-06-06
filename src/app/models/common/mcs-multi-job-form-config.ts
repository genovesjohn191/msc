import { DynamicFormFieldConfigBase } from "@app/features-shared/dynamic-form/dynamic-form-field-config.base";

export class McsMultiJobFormConfig {
  public formTitle?: string;
  public dynamicFormConfig?: DynamicFormFieldConfigBase[];

  constructor(options: {
    formTitle: string;
    dynamicFormConfig: DynamicFormFieldConfigBase[];
  }) {
    this.formTitle = options?.formTitle || '';
    this.dynamicFormConfig = options?.dynamicFormConfig || [];
  }
}
