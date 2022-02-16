import { DynamicFormFieldConfigBase } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementService, McsObjectCrispElementServiceAttribute } from '@app/models';
import { WorkflowGroupSaveState } from '../workflow-group.interface';

export interface LaunchPadForm {
  config: DynamicFormFieldConfigBase[];

  mapContext?: (context: WorkflowGroupSaveState)
  => { key: string, value: any }[]

  mapCrispElementAttributes?: (attributes: McsObjectCrispElementServiceAttribute[], associatedServices?: McsObjectCrispElementService[])
  => { key: string, value: any }[]
}
