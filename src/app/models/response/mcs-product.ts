import { JsonProperty } from 'json-object-mapper';
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
  public version: string;
  public order: number;
  public parentProductId: string;
  public description: string;
  public shortDescription: string;

  @JsonProperty({ type: McsProductUseCase })
  public useCases: McsProductUseCase[];

  public pciDetails: string;
  public featureBenefitMatrix: string;
  public sowDetails: string;
  public proposalDetails: string;
  public competitiveIntelligence: string;
  public targetMarketInfo: string;
  public price: string;
  public retailPrice: string;
  public recurringPrice: string;
  public serviceIdPrefix: string;
  public elementCode: number;

  @JsonProperty({ type: McsProductLocation })
  public locations: McsProductLocation[];

  @JsonProperty({ type: McsProductDependency })
  public dependentProducts: McsProductDependency[];

  @JsonProperty({ type: McsProductOwner })
  public primaryOwner: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public secondaryOwner: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public tertiaryOwner: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public architectOwnerPrimary: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public architectOwnerSecondary: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public specialistOwner: McsProductOwner;

  @JsonProperty({ type: McsProductOption })
  public productOptions: McsProductOption[];

  public icon: string;

  @JsonProperty({ type: McsProductInview })
  public inviewPremium: McsProductInview[];

  @JsonProperty({ type: McsProductInview })
  public inviewStandard: McsProductInview[];

  @JsonProperty({
    type: ProductAvailabilityState,
    serializer: ProductAvailabilityStateSerialization,
    deserializer: ProductAvailabilityStateSerialization
  })
  public availabilityState: ProductAvailabilityState;

  public name: string;
  public displayOrder: number;
  public catalogId: string;
  public categoryId: string;

  constructor() {
    super();
    this.version = undefined;
    this.order = undefined;
    this.shortDescription = undefined;
    this.description = undefined;
    this.useCases = undefined;
    this.pciDetails = undefined;
    this.featureBenefitMatrix = undefined;
    this.sowDetails = undefined;
    this.proposalDetails = undefined;
    this.competitiveIntelligence = undefined;
    this.targetMarketInfo = undefined;
    this.price = undefined;
    this.retailPrice = undefined;
    this.recurringPrice = undefined;
    this.locations = undefined;
    this.serviceIdPrefix = undefined;
    this.elementCode = undefined;
    this.name = undefined;
    this.displayOrder = undefined;
    this.catalogId = undefined;
    this.categoryId = undefined;
    this.dependentProducts = undefined;
    this.primaryOwner = undefined;
    this.secondaryOwner = undefined;
    this.architectOwnerPrimary = undefined;
    this.architectOwnerSecondary = undefined;
    this.specialistOwner = undefined;
    this.productOptions = undefined;
    this.inviewPremium = undefined;
    this.inviewStandard = undefined;
    this.icon = undefined;
    this.tertiaryOwner = undefined;
    this.availabilityState = undefined;
  }

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
