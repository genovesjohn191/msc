import { JsonProperty } from '@app/utilities';

export class McsReportGenericItem {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public period: string = undefined;

  @JsonProperty()
  public value: number = undefined;
}
