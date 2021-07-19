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

  @JsonProperty()
  public service: string = undefined;

  @JsonProperty()
  public protocol: string = undefined;

  @JsonProperty()
  public priority: number = undefined;

  @JsonProperty()
  public weight: number = undefined;

  @JsonProperty()
  public port: number = undefined;
}
