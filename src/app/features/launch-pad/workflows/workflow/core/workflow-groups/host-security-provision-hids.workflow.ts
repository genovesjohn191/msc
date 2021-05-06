import {
  ProductType,
  WorkflowType
} from '@app/models';
import { hostSecurityProvisionHidsForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class HostSecurityProvisionHidsWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.HostSecurityProvisionHids,
    crispProductType: ProductType.ServerHostIntrusionPreventionSystem,
    title: 'Provision HIDS',
    form: hostSecurityProvisionHidsForm
  };
}