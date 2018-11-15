import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../mcs-entity.base';
import { McsProductDependency } from './mcs-product-dependency';
import { McsProductUseCase } from './mcs-product-use-case';
import { McsProductOwner } from './mcs-product-owner';
import { McsProductOption } from './mcs-product-option';
import { McsProductLocation } from './mcs-product-location';
import { McsProductInview } from './mcs-product-inview';

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
  public architectOwnerPrimary: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public architectOwnerSecondary: McsProductOwner;

  @JsonProperty({ type: McsProductOwner })
  public specialistOwner: McsProductOwner;

  @JsonProperty({ type: McsProductOption })
  public productOptions: McsProductOption[];

  @JsonProperty({ type: McsProductInview })
  public inviewPremium: McsProductInview[];

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
  }
}
