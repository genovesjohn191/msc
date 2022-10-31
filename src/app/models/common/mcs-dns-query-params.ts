import { JsonProperty } from '@app/utilities';

export class McsDnsRequestParams {
  @JsonProperty({ name: 'serviceId' })
  public serviceId?: string = undefined;

  @JsonProperty({ name: 'zoneName' })
  public zoneName?: string = undefined;
}
