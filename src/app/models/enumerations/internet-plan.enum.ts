import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum InternetPlan {
  Unknown = 0,
  Prepaid,
  Unlimited,
  NintyFifthPercentile
}

export const internetPlanText = {
  [InternetPlan.Unknown]: 'Unknown',
  [InternetPlan.Prepaid]: 'Prepaid',
  [InternetPlan.Unlimited]: 'Unlimited',
  [InternetPlan.NintyFifthPercentile]: '95th Percentile'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('InternetPlanSerialization')
export class InternetPlanSerialization
  extends McsEnumSerializationBase<InternetPlan> {
  constructor() { super(InternetPlan); }
}
