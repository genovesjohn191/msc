import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { vdcNetworkCreateForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VdcNetworkCreateWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VdcNetworkCreate,
    title: 'Provision VDC Network',
    form: vdcNetworkCreateForm,
    featureFlag: McsFeatureFlag.WorkflowCreateVdcNetwork
  };
}