import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PlannedWorkType {
  Emergency = 0,
  Hazard,
  Outage,
  Unknown
}

export const plannedWorkTypeText = {
  [PlannedWorkType.Emergency]: 'Emergency',
  [PlannedWorkType.Hazard]: 'Hazard',
  [PlannedWorkType.Outage]: 'Outage',
  [PlannedWorkType.Unknown]: 'Unknown'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PlannedWorkTypeSerialization
  extends McsEnumSerializationBase<PlannedWorkType> {
  constructor() { super(PlannedWorkType); }
}
