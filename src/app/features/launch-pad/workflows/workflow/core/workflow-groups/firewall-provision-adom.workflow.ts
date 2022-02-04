import {
  WorkflowType
} from '@app/models';
import { firewallProvisionAdomForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallProvisionAdomWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallProvisionAdom,
    title: 'Provision Firewall ADOM',
    form: firewallProvisionAdomForm
  };
}