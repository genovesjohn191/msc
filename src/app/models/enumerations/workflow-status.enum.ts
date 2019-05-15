import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum WorkflowStatus {
  Unknown = 0,
  Incomplete,
  Draft,
  AwaitingApproval,
  Submitted,
  Provisioning,
  Cancelled,
  Rejected
}

export const workflowStatusText = {
  [WorkflowStatus.Unknown]: 'Unknown',
  [WorkflowStatus.Incomplete]: 'Incomplete',
  [WorkflowStatus.Draft]: 'Draft',
  [WorkflowStatus.AwaitingApproval]: 'Awaiting Approval',
  [WorkflowStatus.Submitted]: 'Submitted',
  [WorkflowStatus.Provisioning]: 'Provisioning',
  [WorkflowStatus.Cancelled]: 'Cancelled',
  [WorkflowStatus.Rejected]: 'Rejected'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('WorkflowStatusSerialization')
export class WorkflowStatusSerialization
  extends McsEnumSerializationBase<WorkflowStatus> {
  constructor() { super(WorkflowStatus); }
}
