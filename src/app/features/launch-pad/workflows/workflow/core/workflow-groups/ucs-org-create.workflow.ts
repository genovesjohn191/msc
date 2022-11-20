import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { ucsOrgCreateForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class UcsOrgCreateWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.UcsOrgCreate,
    title: 'Create UCS Organisation',
    form: ucsOrgCreateForm,
    label: 'Please note, the service ID dropdown above is required only to determine the target company for this workflow.',
    featureFlag: McsFeatureFlag.WorkflowsUcsOrgCreate
  };
}