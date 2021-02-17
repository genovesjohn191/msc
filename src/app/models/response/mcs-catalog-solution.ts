import {
  getSafeProperty,
  isNullOrEmpty,
  JsonProperty
} from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import {
  ProductAvailabilityState,
  ProductAvailabilityStateSerialization
} from '../enumerations/product-availability-state.enum';
import { McsCatalogProductLocation } from './mcs-catalog-product-location';
import { McsCatalogProductOwner } from './mcs-catalog-product-owner';
import { McsCatalogProductUseCase } from './mcs-catalog-product-use-case';
import { McsCatalogSolutionBenefitsAndLimitations } from './mcs-catalog-solution-benefits-and-limitations';
import { McsCatalogSolutionProduct } from './mcs-catalog-solution-product';

export class McsCatalogSolution extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty()
  public groupId: string = undefined;

  @JsonProperty({
    serializer: ProductAvailabilityStateSerialization,
    deserializer: ProductAvailabilityStateSerialization
  })
  public availabilityState: ProductAvailabilityState = undefined;

  @JsonProperty()
  public version: string = undefined;

  @JsonProperty()
  public order: number = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty({ target: McsCatalogProductUseCase })
  public useCases: McsCatalogProductUseCase[] = undefined;

  @JsonProperty({ target: McsCatalogProductLocation })
  public locations: McsCatalogProductLocation[] = undefined;

  @JsonProperty()
  public elementCode: number = undefined;

  @JsonProperty({ target: McsCatalogSolutionProduct })
  public includedProducts: McsCatalogSolutionProduct[] = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public primaryOwner: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public secondaryOwner: McsCatalogProductOwner = undefined;

  @JsonProperty()
  public solutionArchitecture: string = undefined;

  @JsonProperty({ target: McsCatalogSolutionBenefitsAndLimitations })
  public benefitsAndLimitations: McsCatalogSolutionBenefitsAndLimitations[] = undefined;

  /**
   * Returns true when there is an owner atleast 1
   */
  public get hasOwner(): boolean {
    let ownerName = getSafeProperty(this.primaryOwner, (obj) => obj.name) ||
      getSafeProperty(this.secondaryOwner, (obj) => obj.name);
    return !isNullOrEmpty(ownerName);
  }

  public get isActiveIncompleteRelease(): boolean {
    if (isNullOrEmpty(this.availabilityState)) { return false; }
    return this.availabilityState === ProductAvailabilityState.ActiveIncompleteRelease;
  }
}
