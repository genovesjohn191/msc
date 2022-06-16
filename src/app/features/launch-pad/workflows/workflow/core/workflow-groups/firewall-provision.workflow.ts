import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { firewallProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallProvision,
    title: 'Provision Physical Firewall',
    form: firewallProvisionForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}