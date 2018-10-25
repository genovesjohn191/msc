import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

export enum WorkflowStatus {
  Unknown = 0,
  Incomplete,
  Draft,
  RequiresSignoff,
  RequiresPricingApproval,
  PricingApproved,
  Conversions,
  Provisioning,
  BillingProduction,
  Cancelled,
  Completed
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('WorkflowStatusSerialization')
export class WorkflowStatusSerialization
  extends McsEnumSerializationBase<WorkflowStatus> {
  constructor() { super(WorkflowStatus); }
}
