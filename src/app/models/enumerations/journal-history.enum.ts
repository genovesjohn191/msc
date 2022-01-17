import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum JournalHistory {
  Unknown = 0,
  FourHours = 4,
  OneDay = 24,
  TwoDays = 48,
  ThreeDays = 72,
  FourDays = 96,
  FiveDays = 120,
  TenDays = 240,
  FifteenDays = 360,
  TwentyDays = 480,
  TwentyFiveDays = 600,
  ThirtyDays = 720
}

export const JournalHistoryText = {
  [JournalHistory.Unknown]: 'Unknown',
  [JournalHistory.FourHours]: '4 Hours',
  [JournalHistory.OneDay]: '1 Day',
  [JournalHistory.TwoDays]: '2 Days',
  [JournalHistory.ThreeDays]: '3 Days',
  [JournalHistory.FourDays]: '4 Days',
  [JournalHistory.FiveDays]: '5 Days',
  [JournalHistory.TenDays]: '10 Days',
  [JournalHistory.FifteenDays]: '15 Days',
  [JournalHistory.TwentyDays]: '20 Days',
  [JournalHistory.TwentyFiveDays]: '25 Days',
  [JournalHistory.ThirtyDays]: '30 Days'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class JournalHistorySerialization
  extends McsEnumSerializationBase<JournalHistory> {
  constructor() { super(JournalHistory); }
}
