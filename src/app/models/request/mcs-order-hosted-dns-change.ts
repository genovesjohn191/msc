import { JsonProperty } from '@app/utilities';

export class McsOrderHostedDnsChange {

  @JsonProperty()
  public zone: string = undefined;

  @JsonProperty()
  public records: any[] = undefined;

  @JsonProperty()
  public customerReferenceNumber: string = undefined;

  @JsonProperty()
  public phoneConfirmationRequired: boolean = undefined;

  @JsonProperty()
  public notes: string = undefined;
}
