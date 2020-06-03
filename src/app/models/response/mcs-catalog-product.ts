import { JsonProperty } from '@app/utilities';
import { isNullOrEmpty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsCatalogProductDependency } from './mcs-catalog-product-dependency';
import { McsCatalogProductUseCase } from './mcs-catalog-product-use-case';
import { McsCatalogProductOwner } from './mcs-catalog-product-owner';
import { McsCatalogProductOption } from './mcs-catalog-product-option';
import { McsCatalogProductLocation } from './mcs-catalog-product-location';
import { McsCatalogProductInview } from './mcs-catalog-product-inview';
import { McsCatalogProductPciDetail } from './mcs-catalog-product-pci-detail';
import {
  ProductAvailabilityState,
  ProductAvailabilityStateSerialization
} from '../enumerations/product-availability-state.enum';

export class McsCatalogProduct extends McsEntityBase {
  @JsonProperty()
  public version: string = undefined;

  @JsonProperty()
  public order: number = undefined;

  @JsonProperty()
  public parentProductId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public shortDescription: string = undefined;

  @JsonProperty({ target: McsCatalogProductUseCase })
  public useCases: McsCatalogProductUseCase[] = undefined;

  @JsonProperty({ target: McsCatalogProductPciDetail })
  public pciDetails: McsCatalogProductPciDetail[] = undefined;

  @JsonProperty()
  public featureBenefitMatrix: string = undefined;

  @JsonProperty()
  public sowDetails: string = undefined;

  @JsonProperty()
  public proposalDetails: string = undefined;

  @JsonProperty()
  public competitiveIntelligence: string = undefined;

  @JsonProperty()
  public targetMarketInfo: string = undefined;

  @JsonProperty()
  public price: string = undefined;

  @JsonProperty()
  public retailPrice: string = undefined;

  @JsonProperty()
  public recurringPrice: string = undefined;

  @JsonProperty({ target: McsCatalogProductLocation })
  public locations: McsCatalogProductLocation[] = undefined;

  @JsonProperty()
  public serviceIdPrefix: string = undefined;

  @JsonProperty()
  public elementCode: number = undefined;

  @JsonProperty({ target: McsCatalogProductDependency })
  public dependentProducts: McsCatalogProductDependency[] = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public primaryOwner: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public secondaryOwner: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public tertiaryOwner: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public architectOwnerPrimary: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public architectOwnerSecondary: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOwner })
  public specialistOwner: McsCatalogProductOwner = undefined;

  @JsonProperty({ target: McsCatalogProductOption })
  public productOptions: McsCatalogProductOption[] = undefined;

  @JsonProperty()
  public icon: string = undefined;

  @JsonProperty({ target: McsCatalogProductInview })
  public inviewPremium: McsCatalogProductInview[] = undefined;

  @JsonProperty({ target: McsCatalogProductInview })
  public inviewStandard: McsCatalogProductInview[] = undefined;

  @JsonProperty({
    serializer: ProductAvailabilityStateSerialization,
    deserializer: ProductAvailabilityStateSerialization
  })
  public availabilityState: ProductAvailabilityState = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public displayOrder: number = undefined;

  @JsonProperty()
  public platformId: string = undefined;

  @JsonProperty()
  public familyId: string = undefined;

  @JsonProperty()
  public groupId: string = undefined;

  /**
   * Returns true when this product has product list options
   */
  public get hasProductListOptions(): boolean {
    if (isNullOrEmpty(this.productOptions)) { return false; }
    return !!this.productOptions.find((option) => !isNullOrEmpty(option.listOptions));
  }

  /**
   * Returns true when this product has properties options
   */
  public get hasProductProperties(): boolean {
    if (isNullOrEmpty(this.productOptions)) { return false; }
    return !!this.productOptions.find((option) => !isNullOrEmpty(option.properties));
  }

  public get isActiveIncompleteRelease(): boolean {
    if (isNullOrEmpty(this.availabilityState)) { return false; }
    return this.availabilityState === ProductAvailabilityState.ActiveIncompleteRelease;
  }
}
