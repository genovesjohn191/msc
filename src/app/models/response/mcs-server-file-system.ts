import { JsonProperty } from '@app/utilities';

export class McsServerFileSystem {
  @JsonProperty()
  public path: string = undefined;

  @JsonProperty()
  public capacityGB: number = undefined;

  @JsonProperty()
  public freeSpaceGB: number = undefined;
}
