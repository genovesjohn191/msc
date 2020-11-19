import { JsonProperty } from '@app/utilities';

export class McsReportSecurityScore {
  @JsonProperty()
  public currentScore: number = undefined;

  @JsonProperty()
  public maxScore: number = undefined;
}