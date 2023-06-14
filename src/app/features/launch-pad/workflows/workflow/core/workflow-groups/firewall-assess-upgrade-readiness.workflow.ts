import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';
import { firewallUpgradeReadinessForm } from '../forms/firewall-upgrade-readiness.form';

export class FirewallAssessUpgradeReadinessWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallAssessUpgradeReadiness,
    title: 'Assess Firewall Upgrade Readiness',
    form: firewallUpgradeReadinessForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}