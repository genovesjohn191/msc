import { JsonProperty } from '@app/utilities';

export class McsTerraformDeploymentUpdate {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public tfvars: string = undefined;

  @JsonProperty()
  public tag: string = undefined;
}
