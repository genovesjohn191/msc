import { JsonProperty } from '@app/utilities';

export class McsReportVMRightsizing {
  @JsonProperty()
  public vmName: string = undefined;

  @JsonProperty()
  public totalScore: number = undefined;

  @JsonProperty()
  public cpuScore: number = undefined;

  @JsonProperty()
  public memoryScore: string = undefined;

  @JsonProperty()
  public diskScore: string = undefined;

  @JsonProperty()
  public size: string = undefined;

  @JsonProperty()
  public region: string = undefined;

  @JsonProperty()
  public projectedComputeCost: number = undefined;

  @JsonProperty()
  public recommendationSavings: number = undefined;

  @JsonProperty()
  public recommendation: string = undefined;
}