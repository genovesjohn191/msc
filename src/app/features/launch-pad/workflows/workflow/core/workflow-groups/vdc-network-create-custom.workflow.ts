import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { vdcNetworkCreateCustomForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VdcNetworkCreateCustomWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VdcNetworkCreate,
    title: 'Provision VDC Network',
    form: vdcNetworkCreateCustomForm,
    featureFlag: McsFeatureFlag.WorkflowCreateVdcNetwork
  };
}