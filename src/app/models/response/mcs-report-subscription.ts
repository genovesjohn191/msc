import { JsonProperty } from '@app/utilities';

export class McsReportSubscription {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public name: string = undefined;
}
