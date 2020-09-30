export type LaunchPadWorkflowType =
    'servers.newcvm'
  | 'servers.changecvm'
  | 'servers.av'
  | 'servers.backup'
  | 'servers.hids';

export interface Workflow {
  type: LaunchPadWorkflowType;
  referenceId: string;
  parentReferenceId?: string;
  serviceId?: string;
  parentServiceId?: string;
  properties: any[];
}
