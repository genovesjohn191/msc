import { compareDates, getCurrentDate, JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  PlannedWorkStatus,
  PlannedWorkStatusSerialization,
  plannedWorkStatusText
} from '../enumerations/planned-work-status.enum';
import {
  PlannedWorkType,
  PlannedWorkTypeSerialization,
  plannedWorkTypeText
} from '../enumerations/planned-work-type.enum';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsPlannedWork extends McsEntityBase {
  
  @JsonProperty()
  public referenceId?: string = undefined;

  @JsonProperty({
    serializer: PlannedWorkStatusSerialization,
    deserializer: PlannedWorkStatusSerialization
  })
  public status: PlannedWorkStatus = undefined;

  @JsonProperty({
    serializer: PlannedWorkTypeSerialization,
    deserializer: PlannedWorkTypeSerialization
  })
  public type: PlannedWorkType = undefined;

  @JsonProperty()
  public summary: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public plannedStart: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public plannedEnd: Date = undefined;

  @JsonProperty()
  public outageDurationMinutes: number = undefined;
  
  /**
   * Returns the status label equivalent
   */
  public get statusLabel(): string {
    switch(this.status){
      case 2:
        return 'In Progress';
      case 3:
        return 'In Review';
      default:
        return plannedWorkStatusText[this.status];
    }
  }

  /**
   * Returns the type label equivalent
   */
  public get typeLabel(): string {
    return plannedWorkTypeText[this.type];
  }

  /**
   * Returns the outage duration minutes
   * and returns null for hazard type with zero minutes
   */
   public get outageDuration(): number {
    if(this.type === PlannedWorkType.Hazard && this.outageDurationMinutes === 0){
      return null;
    }
    return this.outageDurationMinutes;
  }
}
