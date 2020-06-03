import { JsonProperty } from '@app/utilities';

export class McsServerCreateAddOnSqlServer {
  @JsonProperty()
  public sqlServer: string = undefined;
}
