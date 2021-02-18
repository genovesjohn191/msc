import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InternetPlan {
  Unknown = 0,
  Prepaid,
  Unlimited,
  NinetyFifthPercentile
}

export const internetPlanText = {
  [InternetPlan.Unknown]: 'Unknown',
  [InternetPlan.Prepaid]: 'Prepaid',
  [InternetPlan.Unlimited]: 'Unlimited',
  [InternetPlan.NinetyFifthPercentile]: '95th Percentile'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class InternetPlanSerialization
  extends McsEnumSerializationBase<InternetPlan> {
  constructor() { super(InternetPlan); }
}
