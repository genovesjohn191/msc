import { JsonProperty } from 'json-object-mapper';
import { McsEntityBase } from '../../../../core';
import { ProductDependency } from './product-dependency';

export class Product extends McsEntityBase {
  public version: number;
  public order: number;
  public parentProduct: string;   // This should be a parentProductId
  public description: string;
  public shortDescription: string;
  public useCases: string;
  public pciDetails: string;
  public featureBenefitMatrix: string;
  public sowDetails: string;
  public proposalDetails: string;
  public competitiveIntelligence: string;
  public targetMarketInfo: string;
  public price: string;
  public retailPrice: string;
  public recurringPrice: string;
  public locations: string;
  public serviceIdPrefix: string;
  public elementCode: number;
  public name: string;
  public displayOrder: number;
  public catalogId: string;
  public categoryId: string;

  @JsonProperty({ type: ProductDependency })
  public dependentProducts: ProductDependency[];

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
  }
}
