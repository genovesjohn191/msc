import { JsonProperty } from '@app/utilities';

export class McsNetworkDnsZoneTtlRequest {
  @JsonProperty()
  public ttlSeconds: number = undefined;
}