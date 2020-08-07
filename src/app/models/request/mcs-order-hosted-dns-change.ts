import { JsonProperty } from '@app/utilities';

export class McsOrderHostedDnsChange {

  // TODO: replace with own Type
  @JsonProperty()
  public addRecords: any[] = undefined;

  // TODO: replace with own Type
  @JsonProperty()
  public removeRecords: any[] = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
