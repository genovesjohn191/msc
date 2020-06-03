import { JsonProperty } from '@app/utilities';

export class McsServerThumbnail {
  @JsonProperty()
  public fileType: string = undefined;

  @JsonProperty()
  public encoding: string = undefined;

  @JsonProperty()
  public file: string = undefined;
}
