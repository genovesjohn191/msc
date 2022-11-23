import { JsonProperty } from '@app/utilities';

export class McsNetworkDnsRecordRequest {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public ttlSeconds: number = undefined;

  @JsonProperty()
  public data: any = undefined;

  @JsonProperty()
  public target: string = undefined;

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

  @JsonProperty()
  public order: number = undefined;

  @JsonProperty()
  public preference: number = undefined;

  @JsonProperty()
  public flags: string = undefined;

  @JsonProperty()
  public regexp: string = undefined;

  @JsonProperty()
  public replacement: string = undefined;

  @JsonProperty()
  public respPerson: string = undefined;

  @JsonProperty()
  public refresh: number = undefined;

  @JsonProperty()
  public retry: number = undefined;

  @JsonProperty()
  public expire: number = undefined;

  @JsonProperty()
  public minimum: number = undefined;
}
