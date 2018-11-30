import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderWorkflowAction {
  Unknown = 0,
  Draft,
  Approve,
  Reject,
  Submit
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderWorkflowActionSerialization')
export class OrderWorkflowActionSerialization
  extends McsEnumSerializationBase<OrderWorkflowAction> {
  constructor() { super(OrderWorkflowAction); }
}
