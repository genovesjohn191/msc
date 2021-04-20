import { JsonProperty } from '@app/utilities';

export class McsTerraformDeploymentCreate {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public subscriptionId: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public tag: string = undefined;
}
