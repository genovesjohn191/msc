import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderWorkflowAction {
  Unknown = 0,
  Incomplete,
  Draft,
  AwaitingApproval,
  Submitted,
  Provisioning,
  Cancelled,
  Rejected
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderWorkflowActionSerialization')
export class OrderWorkflowActionSerialization
  extends McsEnumSerializationBase<OrderWorkflowAction> {
  constructor() { super(OrderWorkflowAction); }
}
