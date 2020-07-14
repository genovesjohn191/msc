import { JsonProperty } from '@app/utilities';

export class McsOrderServiceCustomChange {

  @JsonProperty()
  public change: string = undefined;

  @JsonProperty()
  public changeObjective: string = undefined;

  @JsonProperty()
  public testCases: string[] = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
