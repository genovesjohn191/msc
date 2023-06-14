import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';
import { firewallUpgradeForm } from '../forms/firewall-upgrade.form';

export class FirewallUpgradeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallUpgrade,
    title: 'Upgrade Firewall',
    form: firewallUpgradeForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}