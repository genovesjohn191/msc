import { JsonProperty } from '@peerlancers/json-serialization';
import { isNullOrEmpty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsProductDependency } from './mcs-product-dependency';
import { McsProductUseCase } from './mcs-product-use-case';
import { McsProductOwner } from './mcs-product-owner';
import { McsProductOption } from './mcs-product-option';
import { McsProductLocation } from './mcs-product-location';
import { McsProductInview } from './mcs-product-inview';
import {
  ProductAvailabilityState,
  ProductAvailabilityStateSerialization
} from '../enumerations/product-availability-state.enum';

export class McsProduct extends McsEntityBase {
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

  @JsonProperty({ target: McsProductUseCase })
  public useCases: McsProductUseCase[] = undefined;

  @JsonProperty()
  public pciDetails: string = undefined;

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

  @JsonProperty()
  public serviceIdPrefix: string = undefined;

  @JsonProperty()
  public elementCode: number = undefined;

  @JsonProperty({ target: McsProductLocation })
  public locations: McsProductLocation[] = undefined;

  @JsonProperty({ target: McsProductDependency })
  public dependentProducts: McsProductDependency[] = undefined;

  @JsonProperty({ target: McsProductOwner })
  public primaryOwner: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOwner })
  public secondaryOwner: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOwner })
  public tertiaryOwner: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOwner })
  public architectOwnerPrimary: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOwner })
  public architectOwnerSecondary: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOwner })
  public specialistOwner: McsProductOwner = undefined;

  @JsonProperty({ target: McsProductOption })
  public productOptions: McsProductOption[] = undefined;

  @JsonProperty()
  public icon: string = undefined;

  @JsonProperty({ target: McsProductInview })
  public inviewPremium: McsProductInview[] = undefined;

  @JsonProperty({ target: McsProductInview })
  public inviewStandard: McsProductInview[] = undefined;

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
  public catalogId: string = undefined;

  @JsonProperty()
  public categoryId: string = undefined;

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
