import { JsonProperty } from '@app/utilities';

export class McsReportInefficientVms {
  @JsonProperty()
  public vmName: string = undefined;

  @JsonProperty()
  public efficiency: number = undefined;

  @JsonProperty()
  public size: string = undefined;

  @JsonProperty()
  public totalHours: number = undefined;
}