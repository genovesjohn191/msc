import { DynamicFormFieldConfigBase } from '@app/features-shared/dynamic-form';
import { WorkflowType } from '@app/models';
import { isNullOrEmpty, isNullOrUndefined } from '@app/utilities';
import { Workflow } from './workflow.interface';

export class LaunchPadWorkflow implements Workflow {
  public type: WorkflowType;
  public referenceId: string;
  public parentReferenceId?: string;
  public serviceId?: string;
  public productId?: string;
  public title: string;
  public required: boolean = false;
  public label?: string;
  public getAccountUser?: boolean = false;
  public invalidUser?: boolean;
  public singleUserWarningText?: string;
  public properties: DynamicFormFieldConfigBase[];
  public hasValueOverride: boolean = false;

  public constructor(options: {
    type: WorkflowType,
    title: string,
    referenceId: string,
    required?: boolean,
    serviceId?: string,
    productId?: string,
    parentReferenceId?: string,
    label?: string,
    getAccountUser?: boolean,
    invalidUser?: boolean,
    singleUserWarningText?: string,
    properties: DynamicFormFieldConfigBase[],
    data?: { key: string, value: any }[]
  }) {
    this.title = options.title;
    this.required = options.required || false;
    this.type = options.type;
    this.referenceId = options.referenceId;
    this.parentReferenceId = options.parentReferenceId || '';
    this.serviceId = options.serviceId;
    this.productId = options.productId;
    this.label = options.label,
    this.getAccountUser = options.getAccountUser,
    this.singleUserWarningText = options.singleUserWarningText,
    this.invalidUser = options.invalidUser,
    this.properties = options.properties;

    this._setDefaultValues(options.data);
  }

  private _setDefaultValues(params?: { key: string, value: any }[]): void {
    this.hasValueOverride = !isNullOrEmpty(params);
    if (this.hasValueOverride) {
      this._overrideDefaultValues(params);
    } else {
      this._resetDefaultValues();
    }
  }

  private _resetDefaultValues(): void {
    this.properties.forEach((prop) => {
      prop.initialValue = '';
    });
  }

  private _overrideDefaultValues(params: { key: string, value: any }[]): void {
    params.forEach((param) => {
      if (isNullOrEmpty(param.key) || isNullOrUndefined(param.value)) { return; }

      let field = this.properties.find((property) => param.key === property.key);

      if (!isNullOrEmpty(field)) {
        field.value = param.value;
        field.initialValue = param.value;
      }
    });
  }
}
