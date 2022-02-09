import {
  WorkflowType
} from '@app/models';
import { firewallAllocateForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class FirewallAllocateWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.FirewallAllocate,
    title: 'Allocate Physical Firewall',
    form: firewallAllocateForm
  };
}