import { JsonProperty } from '@peerlancers/json-serialization';
import { McsProductInviewThreshold } from './mcs-product-inview-threshold';

export class McsProductInview {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public graphUrl: string = undefined;

  @JsonProperty({ target: McsProductInviewThreshold })
  public thresholds: McsProductInviewThreshold[] = undefined;
}
