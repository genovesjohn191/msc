import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum CrispObjectStatus {
  Unknown = '*',
  RequiresSignOff = 'REQUIRES_SIGNOFF',
  RequiresPricingApproval = 'REQUIRES_PRICING_APPROVAL',
  PricingApproved = 'PRICING_APPROVED',
  Conversions = 'CONVERSIONS',
  Transprov = 'TRANSPROV',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  PricingDesignRejected = 'PRICING_DESIGN_REJECTED',
  CompletedPendingInView = 'COMPLETED_PENDING_INVIEW',
  Incomplete = 'INCOMPLETE',
  Draft = 'DRAFT'
}

export const crispObjectStatusText = {
  [CrispObjectStatus.Unknown]: 'Unknown',
  [CrispObjectStatus.RequiresSignOff]: 'Requires Signoff',
  [CrispObjectStatus.RequiresPricingApproval]: 'Requires Pricing Approval',
  [CrispObjectStatus.PricingApproved]: 'Pricing Approved',
  [CrispObjectStatus.Conversions]: 'Conversions',
  [CrispObjectStatus.Transprov]: 'Transition/Provisioning',
  [CrispObjectStatus.Completed]: 'Completed',
  [CrispObjectStatus.Cancelled]: 'Cancelled',
  [CrispObjectStatus.PricingDesignRejected]: 'Pricing Design Rejected',
  [CrispObjectStatus.CompletedPendingInView]: 'Completed Pending Inview',
  [CrispObjectStatus.Incomplete]: 'Incomplete',
  [CrispObjectStatus.Draft]: 'Draft',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class CrispObjectStatusSerialization
  extends McsEnumSerializationBase<CrispObjectStatus> {
  constructor() { super(CrispObjectStatus); }
}
