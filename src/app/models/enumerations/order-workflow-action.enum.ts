import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderWorkflowAction {
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

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderWorkflowActionSerialization
  extends McsEnumSerializationBase<OrderWorkflowAction> {
  constructor() { super(OrderWorkflowAction); }
}
