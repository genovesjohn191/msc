import {
  ProductType,
  WorkflowType
} from '@app/models';
import { hostSecurityProvisionAntiVirusForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class HostSecurityProvisionAntiVirusWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.HostSecurityProvisionAntiVirus,
    crispProductType: ProductType.ServerAntiVirus,
    title: 'Provision Anti-Virus',
    form: hostSecurityProvisionAntiVirusForm
  };
}