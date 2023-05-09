import { JsonProperty } from '@app/utilities';
import { McsServerOsUpdatesScheduleDetails } from './mcs-server-os-updates-schedule-details';

export class McsServerOsUpdatesJob {
  @JsonProperty({ target: McsServerOsUpdatesScheduleDetails })
  public schedule: McsServerOsUpdatesScheduleDetails = undefined;

  public status: string;
}
