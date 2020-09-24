import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { Guid, isNullOrEmpty } from '@app/utilities';
import { LaunchPadWorkflowType, Workflow } from './workflow.interface';

export class LaunchPadWorkflow implements Workflow {
  public type: LaunchPadWorkflowType;
  public referenceId: string;
  public parentReferenceId?: string;
  public serviceId?: string;
  public parentServiceId?: string;
  public title: string;
  public required: boolean = false;
  public properties: DynamicFormFieldDataBase[];

  public constructor(options: {
    type: LaunchPadWorkflowType,
    title: string,
    required?: boolean,
    serviceId?: string,
    parentServiceId?: string,
    parentReferenceId?: string,
    properties: DynamicFormFieldDataBase[],
    params?: { key: string, value: any }[]
  }) {
    this.title = options.title;
    this.required = options.required || false;
    this.type = options.type;
    this.referenceId = Guid.newGuid().toString();
    this.parentReferenceId = options.parentReferenceId || '';
    this.serviceId = options.serviceId;
    this.parentServiceId = options.parentServiceId || '';
    this.properties = options.properties;

    this.setDefaultValues(options.params);
  }

  private setDefaultValues(params?: { key: string, value: any }[]): void {
    if (isNullOrEmpty(params)) {
      return;
    }

    params.forEach((param) => {
      if (isNullOrEmpty(param.key) || isNullOrEmpty(param.value)) {
        return;
      }

      let field = this.properties.find((property) => param.key === property.key);
      if (!isNullOrEmpty(field)) {
        field.value = param.value;
      }
    });
  }
}
