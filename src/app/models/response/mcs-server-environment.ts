import { JsonProperty } from '@peerlancers/json-serialization';
import { McsResource } from './mcs-resource';

export class McsServerEnvironment {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty({ target: McsResource })
  public resources: McsResource[] = undefined;
}
