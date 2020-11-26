import { DynamicFormFieldDataBase } from '@app/features-shared/dynamic-form';
import { McsObjectCrispElementServiceAttribute } from '@app/models';
import { WorkflowGroupSaveState } from '../workflow-group.interface';

export interface LaunchPadForm {
  config: DynamicFormFieldDataBase[];

  crispElementConverter?: (context: WorkflowGroupSaveState, attributes: McsObjectCrispElementServiceAttribute[])
  => { key: string, value: any }[]
}
