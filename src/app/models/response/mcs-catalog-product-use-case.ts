import { JsonProperty } from '@app/utilities';

export class McsCatalogProductUseCase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public displayOrder: string = undefined;
}
