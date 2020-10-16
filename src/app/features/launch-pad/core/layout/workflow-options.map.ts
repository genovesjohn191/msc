import { WorkflowSelectorItem } from './workflow-selector/workflow-selector.service';
import { WorkflowGroupId } from '../workflows/workflow-groups/workflow-group-type.enum';

// Workflow: Add workflow group to selector options
export const workflowOptions: Map<WorkflowGroupId, WorkflowSelectorItem> = new Map([
  [WorkflowGroupId.ProvisionVm, {
    id: WorkflowGroupId.ProvisionVm,
    name: 'Provision VM',
    description: 'Lorem ipsum dolor sit amet.'
  }],

  [WorkflowGroupId.ChangeVm, {
    id: WorkflowGroupId.ChangeVm,
    name: 'Change VM',
    description: 'Lorem ipsum dolor sit amet.'
  }],

  [WorkflowGroupId.DeprovisionVm, {
    id: WorkflowGroupId.DeprovisionVm,
    name: 'Deprovision VM',
    description: 'Lorem ipsum dolor sit amet.'
  }],

  [WorkflowGroupId.AddHids, {
    id: WorkflowGroupId.AddHids,
    name: 'Provision HIDS',
    description: 'Lorem ipsum dolor sit amet.'
  }],

  [WorkflowGroupId.AddAntiVirus, {
    id: WorkflowGroupId.AddAntiVirus,
    name: 'Provision Anti-Virus',
    description: 'Lorem ipsum dolor sit amet.'
  }]
]);
