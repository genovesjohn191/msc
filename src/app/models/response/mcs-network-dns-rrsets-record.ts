import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';

export class McsNetworkDnsRrSetsRecord extends McsEntityBase {
  @JsonProperty()
  public serial: number = undefined;

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

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public mname: string = undefined;

  @JsonProperty()
  public data: any = undefined;

  @JsonProperty()
  public priority: number = undefined;

  @JsonProperty()
  public weight: number = undefined;

  @JsonProperty()
  public port: number = undefined;

  @JsonProperty()
  public target: string = undefined;

  @JsonProperty()
  public order: number = undefined;

  @JsonProperty()
  public preference: number = undefined;

  @JsonProperty()
  public flags: string = undefined;

  @JsonProperty()
  public service: string = undefined;

  @JsonProperty()
  public regexp: string = undefined;

  @JsonProperty()
  public replacement: string = undefined;

  @JsonProperty()
  public protocol: string = undefined;
}
