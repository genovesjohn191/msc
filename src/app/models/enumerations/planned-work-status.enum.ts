import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PlannedWorkStatus {
  Unknown = 0,
  Scheduled,
  Implement,
  Review,
  Closed,
  Cancelled
}

export const plannedWorkStatusText = {
  [PlannedWorkStatus.Unknown]: 'Unknown',
  [PlannedWorkStatus.Scheduled]: 'Scheduled',
  [PlannedWorkStatus.Implement]: 'Implement',
  [PlannedWorkStatus.Review]: 'Review',
  [PlannedWorkStatus.Closed]: 'Closed',
  [PlannedWorkStatus.Cancelled]: 'Cancelled'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PlannedWorkStatusSerialization
  extends McsEnumSerializationBase<PlannedWorkStatus> {
  constructor() { super(PlannedWorkStatus); }
}
