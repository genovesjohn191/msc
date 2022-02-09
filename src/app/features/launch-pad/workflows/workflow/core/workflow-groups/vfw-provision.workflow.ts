import {
  WorkflowType
} from '@app/models';
import { vfwProvisionForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VfwProvisionWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VfwProvision,
    title: 'Provision Virtual Firewall',
    form: vfwProvisionForm
  };
}