import { JsonProperty } from 'json-object-mapper';
import { McsProductInviewThreshold } from './mcs-product-inview-threshold';

export class McsProductInview {
  public name: string;
  public description: string;
  public graphUrl: string;

  @JsonProperty({ type: McsProductInviewThreshold })
  public thresholds: McsProductInviewThreshold[];

  constructor() {
    this.description = undefined;
    this.graphUrl = undefined;
    this.name = undefined;
    this.thresholds = undefined;
  }
}
