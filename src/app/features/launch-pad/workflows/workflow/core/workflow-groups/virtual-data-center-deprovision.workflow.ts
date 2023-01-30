import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { virtualDataCenterDeprovisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VirtualDataCenterDeprovisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VirtualDataCenterDeprovision,
    title: 'Deprovision Virtual Data Center',
    form: virtualDataCenterDeprovisionForm,
    featureFlag: McsFeatureFlag.WorkflowsVirtualDataCenterDeprovision
  };
}