import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum RetentionOption {
  FourteenDays = 14,
  ThirtyDays = 30,
  SixMonths = 180,
  OneYear = 365,
  TwoYears = 730,
  ThreeYears = 1095,
  FourYears = 1460,
  FiveYears = 1825,
  SixYears = 2190,
  SevenYears = 2555
}

export const retentionOptionText = {
  [RetentionOption.FourteenDays]: '14 Days',
  [RetentionOption.ThirtyDays]: '30 Days',
  [RetentionOption.SixMonths]: '6 Months',
  [RetentionOption.OneYear]: '1 Year',
  [RetentionOption.TwoYears]: '2 Years',
  [RetentionOption.ThreeYears]: '3 Years',
  [RetentionOption.FourYears]: '4 Years',
  [RetentionOption.FiveYears]: '5 Years',
  [RetentionOption.SixYears]: '6 Years',
  [RetentionOption.SevenYears]: '7 Years',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ProvisioningStatusSerialization
  extends McsEnumSerializationBase<RetentionOption> {
  constructor() { super(RetentionOption); }
}
