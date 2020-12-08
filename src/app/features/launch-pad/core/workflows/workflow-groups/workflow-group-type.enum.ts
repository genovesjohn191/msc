// Workflow: Add new workflow group ID here
export enum WorkflowGroupId {
  ProvisionVirtualDataCentreVmInstance,
  AddToManagementToolsCvm,
  RemoveFromManagementToolsCvm
}

export const workflowGroupIdText = {
  [WorkflowGroupId.ProvisionVirtualDataCentreVmInstance]: 'Provision Virtual Data Centre VM Instance',
  [WorkflowGroupId.AddToManagementToolsCvm]: 'Add CVM To Management Tools',
  [WorkflowGroupId.RemoveFromManagementToolsCvm]: 'Remove CVM From Management Tools'
}
