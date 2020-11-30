import { JsonProperty } from '@app/utilities';
import { OperationalSavingsItems } from '@app/models';

export class McsReportOperationalSavings {
  @JsonProperty()
  public totalSavings: number = undefined;

  @JsonProperty()
  public items: OperationalSavingsItems[] = undefined;
}