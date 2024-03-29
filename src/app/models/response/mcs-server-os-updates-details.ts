import { JsonProperty } from '@app/utilities';
import { McsServerOsUpdatesScheduleDetails } from './mcs-server-os-updates-schedule-details';

export class McsServerOsUpdatesDetails {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public updateCount: number = undefined;

  @JsonProperty()
  public lastInspectDate: string = undefined;

  @JsonProperty({ target: McsServerOsUpdatesScheduleDetails })
  public schedule: McsServerOsUpdatesScheduleDetails = undefined;
}
