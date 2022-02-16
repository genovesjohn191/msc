import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { vfwDeprovisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VfwDeprovisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VfwDeprovision,
    title: 'Deprovision Virtual Firewall',
    form: vfwDeprovisionForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}