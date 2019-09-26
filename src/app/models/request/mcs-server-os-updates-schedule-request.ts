import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerOsUpdatesScheduleRequest {
  @JsonProperty()
  public runOnce: boolean = undefined;

  @JsonProperty()
  public crontab: string = undefined;

  @JsonProperty()
  public categories: string[] = undefined;

  @JsonProperty()
  public updates: string[] = undefined;
}
