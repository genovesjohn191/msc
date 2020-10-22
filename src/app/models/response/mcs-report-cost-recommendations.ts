import { TextPhoneNumberFormatPipe } from '@app/shared/pipes/text-phonenumber-format.pipe';
import { JsonProperty } from '@app/utilities';

export class McsReportCostRecommendations {
  @JsonProperty()
  public actual: number = undefined;

  @JsonProperty()
  public budget: number = undefined;

  @JsonProperty()
  public variance: number = undefined;

  @JsonProperty()
  public potentialOperationalSavings: number = undefined;

  @JsonProperty()
  public potentialRightsizingSavings: number = undefined;

  @JsonProperty()
  public updatedOn: string = undefined;
}
