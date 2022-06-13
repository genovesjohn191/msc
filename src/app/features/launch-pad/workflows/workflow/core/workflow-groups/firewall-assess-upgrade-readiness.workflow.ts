import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { standardContextMapper } from '../forms/shared/standard-context-mapper';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallAssessUpgradeReadinessWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallAssessUpgradeReadiness,
    title: 'Assess Firewall Upgrade Readiness',
    form: {
      config: [],
      mapContext: standardContextMapper,
    },
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}