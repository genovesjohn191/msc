import { JsonProperty } from '@app/utilities';
import { McsServerOsUpdatesScheduleDetailsRequest } from './mcs-server-os-updates-schedule-details-request';

export class McsServerOsUpdatesScheduleRequest {
  @JsonProperty()
  public snapshot: boolean = undefined;

  @JsonProperty()
  public restart: boolean = undefined;

  @JsonProperty()
  public schedule: McsServerOsUpdatesScheduleDetailsRequest = undefined;

  @JsonProperty()
  public categories: string[] = undefined;

  @JsonProperty()
  public updates: string[] = undefined;
}
