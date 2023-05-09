import { JsonProperty } from '@app/utilities';

export class McsServerOsUpdatesScheduleDetailsRequest {
  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public weekdayOrdinals: number[] = undefined;

  @JsonProperty()
  public weekdays: number[] = undefined;

  @JsonProperty()
  public time: string = undefined;

  @JsonProperty()
  public dates: string[] = undefined;
}
