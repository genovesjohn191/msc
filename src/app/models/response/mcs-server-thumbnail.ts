import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerThumbnail {
  @JsonProperty()
  public fileType: string = undefined;

  @JsonProperty()
  public encoding: string = undefined;

  @JsonProperty()
  public file: string = undefined;
}
