import { JsonProperty } from '@app/utilities';
import { OperationalSavingsSubItems } from '@app/models';

export class McsReportOperationalSavings {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public savings: number = undefined;

  @JsonProperty()
  public subItems: OperationalSavingsSubItems[] = undefined;
}