import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnSqlServer {
  @JsonProperty()
  public sqlServer: string = undefined;
}
