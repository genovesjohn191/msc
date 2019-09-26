import { JsonProperty } from '@peerlancers/json-serialization';

export class McsTicketCreateAttachment {
  @JsonProperty()
  public fileName: string = undefined;

  @JsonProperty()
  public contents: string = undefined;
}
