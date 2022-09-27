import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { dedicatedBladeDeprovisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedBladeDeprovisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedBladeDeprovision,
    title: 'Deprovision Dedicated Blade',
    form: dedicatedBladeDeprovisionForm,
    featureFlag: McsFeatureFlag.WorkflowsDedicatedBlade
  };
}