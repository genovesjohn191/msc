import { JsonProperty } from '@app/utilities';

export class McsReportTopVmsByCost {

  @JsonProperty()
  public vmName: string = undefined;

  @JsonProperty()
  public totalCost: number = undefined;

  @JsonProperty()
  public totalHours: number = undefined;

  @JsonProperty()
  public reservedHours: number = undefined;
}