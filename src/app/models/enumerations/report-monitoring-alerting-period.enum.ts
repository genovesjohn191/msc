import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum MonitoringAlertingPeriod {
  OneMonth = 1,
  TwoWeeks = 2,
  OneWeek = 3,
  Today = 4
}

export const monitoringAlertingPeriodText = {
  [MonitoringAlertingPeriod.OneMonth]: '1 Month',
  [MonitoringAlertingPeriod.TwoWeeks]: '2 Weeks',
  [MonitoringAlertingPeriod.OneWeek]: '1 Week',
  [MonitoringAlertingPeriod.Today]: 'Today',
};

/**
 * Enumeration serializer and deserializer methods
 */
export class MonitoringAlertingPeriodSerialization
  extends McsEnumSerializationBase<MonitoringAlertingPeriod> {
  constructor() { super(MonitoringAlertingPeriod); }
}