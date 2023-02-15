import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { virtualDataCenterStorageProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VirtualDataCenterStorageProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VirtualDataCenterStorageProvision,
    title: 'Provision Virtual Data Center Storage',
    form: virtualDataCenterStorageProvisionForm,
    featureFlag: McsFeatureFlag.WorkflowsVirtualDataCenterStorageProvision
  };
}