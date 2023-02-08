import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { virtualDataCenterProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VirtualDataCenterProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VirtualDataCenterProvision,
    title: 'Provision Virtual Data Center',
    form: virtualDataCenterProvisionForm,
    getAccountUser: true,
    singleUserWarningText: 'Exactly one organizational unit must exist for this company in Active Directory.',
    featureFlag: McsFeatureFlag.WorkflowsVirtualDataCenterProvision
  };
}