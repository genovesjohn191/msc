import { JsonProperty } from '@app/utilities';

export class McsReportIntegerData {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public value: number = undefined;
}
