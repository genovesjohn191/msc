import {
  McsFeatureFlag,
  WorkflowType
} from '@app/models';
import { standardContextMapper } from '../forms/shared/standard-context-mapper';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallUpgradeWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallUpgrade,
    title: 'Upgrade Firewall',
    form: {
      config: [],
      mapContext: standardContextMapper,
    },
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}