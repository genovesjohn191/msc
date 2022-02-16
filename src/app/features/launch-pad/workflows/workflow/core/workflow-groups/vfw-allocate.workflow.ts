import {
  McsFeatureFlag,
  ProductType,
  WorkflowType
} from '@app/models';
import { vfwAllocateForm } from '../forms';
import { WorkflowGroup } from '../workflow-group.interface';
import { WorkflowConfig } from '../workflow.interface';

export class VfwAllocateWorkflowGroup implements WorkflowGroup {
  public parent: WorkflowConfig = {
    id: WorkflowType.VfwAllocate,
    crispProductType: ProductType.VirtualFirewall,
    title: 'Allocate Virtual Firewall',
    form: vfwAllocateForm,
    featureFlag: McsFeatureFlag.WorkflowsFirewall
  };
}