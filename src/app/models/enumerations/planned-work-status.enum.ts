import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum PlannedWorkStatus {
  Scheduled = 0,
  InProgress,
  InReview,
  Closed,
  Unknown
}

export const plannedWorkStatusText = {
  [PlannedWorkStatus.Scheduled]: 'Scheduled',
  [PlannedWorkStatus.InProgress]: 'In Progress',
  [PlannedWorkStatus.InReview]: 'In Review',
  [PlannedWorkStatus.Closed]: 'Closed',
  [PlannedWorkStatus.Unknown]: 'Unknown'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class PlannedWorkStatusSerialization
  extends McsEnumSerializationBase<PlannedWorkStatus> {
  constructor() { super(PlannedWorkStatus); }
}
