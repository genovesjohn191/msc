import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { firewallDeprovisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallDeprovisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallDeprovision,
    title: 'Deprovision Physical Firewall',
    form: firewallDeprovisionForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}