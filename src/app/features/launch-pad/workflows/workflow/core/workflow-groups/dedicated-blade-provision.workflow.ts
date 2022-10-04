import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { dedicatedBladeProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class DedicatedBladeProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.DedicatedBladeProvision,
    title: 'Provision Dedicated Blade',
    form: dedicatedBladeProvisionForm,
    featureFlag: McsFeatureFlag.WorkflowsDedicatedBladeProvision
  };
}