import { JsonProperty } from '@app/utilities';

export class McsCompute {
  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public memoryMB: number = undefined;

  @JsonProperty()
  public numCores: number = undefined;

  @JsonProperty()
  public cpuMhz: number = undefined;
  
  @JsonProperty()
  public model: string = undefined;

  @JsonProperty()
  public processorModel: string = undefined;
}