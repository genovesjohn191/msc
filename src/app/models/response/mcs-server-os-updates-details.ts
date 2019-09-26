import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerOsUpdatesDetails {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public updateCount: number = undefined;

  @JsonProperty()
  public lastInspectDate: string = undefined;

  @JsonProperty()
  public crontab: string = undefined;

  @JsonProperty()
  public runOnce: boolean = undefined;
}
