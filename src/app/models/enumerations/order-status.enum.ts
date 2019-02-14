import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum OrderStatus {
  Unknown = 0,
  Incomplete = 1,
  Draft = 2,
  RequiresSignoff = 3,
  RequiresPricingApproval = 4,
  PricingApproved = 5,
  Conversions = 6,
  TransitionProvisioning = 7,
  BillingProduction = 8,
  Cancelled = 9,
  Completed = 10
}

export const orderStatusText = {
  [OrderStatus.Unknown]: 'Unknown',
  [OrderStatus.Incomplete]: 'Incomplete',
  [OrderStatus.Draft]: 'Draft',
  [OrderStatus.RequiresSignoff]: 'Requires Sign off',
  [OrderStatus.RequiresPricingApproval]: 'Requires Pricing Approval',
  [OrderStatus.PricingApproved]: 'Pricing Approved',
  [OrderStatus.Conversions]: 'Conversions',
  [OrderStatus.TransitionProvisioning]: 'Provisioning',
  [OrderStatus.BillingProduction]: 'Billing Production',
  [OrderStatus.Cancelled]: 'Cancelled',
  [OrderStatus.Completed]: 'Completed'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('OrderStatusSerialization')
export class OrderStatusSerialization
  extends McsEnumSerializationBase<OrderStatus> {
  constructor() { super(OrderStatus); }
}
