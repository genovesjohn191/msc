import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PeriodRange {
  Today = 0,
  Yesterday,
  EarlierThisWeek,
  EarlierThisMonth,
  EarlierThisYear,
  Older
}

export const periodRangeText = {
  [PeriodRange.Today]: 'Today',
  [PeriodRange.Yesterday]: 'Yesterday',
  [PeriodRange.EarlierThisWeek]: 'Earlier this Week',
  [PeriodRange.EarlierThisMonth]: 'Earlier this Month',
  [PeriodRange.EarlierThisYear]: 'Earlier this Year',
  [PeriodRange.Older]: 'Older'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PeriodRangeSerialization
  extends McsEnumSerializationBase<PeriodRange> {
  constructor() { super(PeriodRange); }
}