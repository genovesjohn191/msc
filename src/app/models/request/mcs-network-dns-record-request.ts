import { JsonProperty } from '@app/utilities';

export class McsNetworkDnsRecordRequest {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public ttlSeconds: number = undefined;

  @JsonProperty()
  public value: string = undefined;
}
