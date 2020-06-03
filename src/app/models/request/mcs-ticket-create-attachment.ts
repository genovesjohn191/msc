import { JsonProperty } from '@app/utilities';

export class McsTicketCreateAttachment {
  @JsonProperty()
  public fileName: string = undefined;

  @JsonProperty()
  public contents: string = undefined;
}
