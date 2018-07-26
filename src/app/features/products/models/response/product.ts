import { McsEntityBase } from '../../../../core';

export class Product extends McsEntityBase {
  public version: number;
  public order: number;
  public shortDescription: string;
  public description: string;
  public useCases: string;
  public pciDetails: string;
  public featureBenefitMatrix: string;
  public sowDetails: string;
  public proposalDetails: string;
  public competitiveIntelligence: string;
  public targetMarketInfo: string;
  public price: number;
  public retailPrice: number;
  public recurringPrice: number;
  public locations: string;
  public serviceIdPrefix: string;
  public elementCode: string;
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
  }
}
