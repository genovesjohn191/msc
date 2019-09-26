import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowStatus {
  Unknown = 0,
  Incomplete,
  Draft,
  AwaitingApproval,
  Submitted,
  Provisioning,
  Cancelled,
  Rejected,
  Completed
}

export const workflowStatusText = {
  [WorkflowStatus.Unknown]: 'Unknown',
  [WorkflowStatus.Incomplete]: 'Incomplete',
  [WorkflowStatus.Draft]: 'Draft',
  [WorkflowStatus.AwaitingApproval]: 'Awaiting Approval',
  [WorkflowStatus.Submitted]: 'Submitted',
  [WorkflowStatus.Provisioning]: 'Provisioning',
  [WorkflowStatus.Cancelled]: 'Cancelled',
  [WorkflowStatus.Rejected]: 'Rejected',
  [WorkflowStatus.Completed]: 'Completed',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowStatusSerialization
  extends McsEnumSerializationBase<WorkflowStatus> {
  constructor() { super(WorkflowStatus); }
}
