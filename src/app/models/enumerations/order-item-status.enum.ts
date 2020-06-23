import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum OrderItemStatus {
  Unknown = 0,
  Incomplete = 1,
  Draft = 2,
  AwaitingApproval = 3,
  RequiresPricingApproval = 4,
  PricingApproved = 5,
  Conversions = 6,
  Provisioning = 7,
  CompletedPendingInview = 8,
  BillingProduction = 9,
  Cancelled = 10,
  Completed = 11,
}

export const orderItemStatusText = {
  [OrderItemStatus.Unknown]: 'Unknown',
  [OrderItemStatus.Incomplete]: 'Incomplete',
  [OrderItemStatus.Draft]: 'Draft',
  [OrderItemStatus.AwaitingApproval]: 'Awaiting Approval',
  [OrderItemStatus.RequiresPricingApproval]: 'Requires Pricing Approval',
  [OrderItemStatus.PricingApproved]: 'Pricing Approved',
  [OrderItemStatus.Conversions]: 'Conversions',
  [OrderItemStatus.Provisioning]: 'Provisioning',
  [OrderItemStatus.CompletedPendingInview]: 'Completed Pending Inview',
  [OrderItemStatus.BillingProduction]: 'Billing Production',
  [OrderItemStatus.Cancelled]: 'Cancelled',
  [OrderItemStatus.Completed]: 'Completed'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class OrderItemStatusSerialization
  extends McsEnumSerializationBase<OrderItemStatus> {
  constructor() { super(OrderItemStatus); }
}
