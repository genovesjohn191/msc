import { JsonProperty } from '@app/utilities';

export class McsServerOsUpdatesScheduleRequest {
  @JsonProperty()
  public runOnce: boolean = undefined;

  @JsonProperty()
  public snapshot: boolean = undefined;

  @JsonProperty()
  public restart: boolean = undefined;

  @JsonProperty()
  public crontab: string = undefined;

  @JsonProperty()
  public categories: string[] = undefined;

  @JsonProperty()
  public updates: string[] = undefined;
}
