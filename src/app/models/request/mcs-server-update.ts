import { JsonProperty } from '@app/utilities';

export class McsServerUpdate {
  @JsonProperty()
  public memoryMB: number = undefined;

  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public restartServer: boolean = undefined;

  @JsonProperty()
  public clientReferenceObject: any = undefined;
}
