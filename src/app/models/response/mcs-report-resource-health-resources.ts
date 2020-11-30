import { JsonProperty } from '@app/utilities';

export class McsReportResourceHealthResources {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public count: number = undefined;
}