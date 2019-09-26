import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsProductDownload extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public fileType: string = undefined;

  @JsonProperty()
  public fileSizeInKB: number = undefined;

  @JsonProperty()
  public url: string = undefined;
}
