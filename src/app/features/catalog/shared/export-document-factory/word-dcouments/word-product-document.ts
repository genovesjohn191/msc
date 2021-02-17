import { CoreRoutes } from '@app/core';
import {
  McsCatalogProduct,
  RouteKey
} from '@app/models';
import {
  isNullOrEmpty,
  DocumentUtility
} from '@app/utilities';

import { CatalogItemDetails } from '../../catalog-item-details';
import { IExportDocument } from '../export-document-interface';

export class WordProductDocument implements IExportDocument {

  public exportDocument(itemDetails: CatalogItemDetails): void {
    if (isNullOrEmpty(itemDetails)) { return; }

    let productDetails = itemDetails.data as McsCatalogProduct;
    let htmlDocument = this._createHtmlDocument(productDetails);
    let fileName = `${productDetails.name}-${Date.now()}`;
    DocumentUtility.generateHtmlDocument(`${fileName}.docx`, htmlDocument);
  }

  private _createHtmlDocument(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails)) { return ``; }

    let htmlString = `
      <div>
        <h1>${productDetails.name}</h1>
        <p><b>${productDetails.serviceIdPrefix}</b> v<small>${productDetails.version}</small></p>
      </div>

      <div>
        <h2>All Information</h2>
        <p>${productDetails.shortDescription}</p>
      </div>

      ${this._createUseCaseHtml(productDetails)}
      ${this._createDescriptionHtml(productDetails)}
      ${this._createProductOptionsHtml(productDetails)}
      ${this._createProductOwnerHtmlString(productDetails)}
      ${this._createDependenciesProductsHtml(productDetails)}
      ${this._createLocationsHtml(productDetails)}
      ${this._createFeatureBenifitsMatrixHtml(productDetails)}
      ${this._createComplianceHtml(productDetails)}
    `;

    return htmlString;
  }

  private _createUseCaseHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.useCases)) { return ``; }
    let useCasesHtml = '';

    productDetails.useCases?.forEach(useCase => {
      useCasesHtml += `<p>${useCase.name} -> ${useCase.description}</p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Use Cases</h2>
        <p>${useCasesHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createDescriptionHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.description)) { return ``; }

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Description</h2>
        <p>${productDetails.description}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createProductOptionsHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.productOptions)) { return ``; }
    let productOptionsHtml = '';

    productDetails.productOptions?.forEach(productOption => {
      productOptionsHtml += `<p>${productOption.name} - ${productOption.listOptions.join(', ')}</p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Product Options</h2>
        <p>${productOptionsHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createProductOwnerHtmlString(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails)) { return ``; }
    let ownershipsHtml = '';

    let filteredOwners = [
      productDetails.primaryOwner,
      productDetails.tertiaryOwner,
      productDetails.architectOwnerPrimary,
      productDetails.architectOwnerSecondary,
      productDetails.secondaryOwner,
      productDetails.specialistOwner
    ].filter(item => !isNullOrEmpty(item));
    if (isNullOrEmpty(filteredOwners)) { return ``; }

    filteredOwners.forEach(owner => {
      ownershipsHtml += `<p>${owner.name} - ${owner.email}</p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Ownerships</h2>
        <p>${ownershipsHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createDependenciesProductsHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.dependentProducts)) { return ``; }
    let dependenciesHtml = '';

    let productCatalogPath = CoreRoutes.getRouteInfoByKey(RouteKey.CatalogProduct);
    productDetails.dependentProducts.forEach(dependent => {
      let dependencyPath = `${window.location.origin}/${productCatalogPath}/${dependent.id}`
      dependenciesHtml += `<p><a href="${dependencyPath}">${dependent.name}</a></p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Dependencies</h2>
        <p>${dependenciesHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createLocationsHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.locations)) { return ``; }
    let locationsHtml = '';

    productDetails.locations.forEach(location => {
      locationsHtml += `<p>${location.name} - ${location.fullAddress}</p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Locations</h2>
        <p>${locationsHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createFeatureBenifitsMatrixHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.featureBenefitMatrix)) { return ``; }

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Feature Benefit Matrix</h2>
        <p>${productDetails.featureBenefitMatrix}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createComplianceHtml(productDetails: McsCatalogProduct): string {
    if (isNullOrEmpty(productDetails.pciDetails)) { return ``; }
    let pciDetailsHtml = '';

    productDetails.pciDetails.forEach(detail => {
      pciDetailsHtml += `<p>${detail.raci}</p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Compliance</h2>
        <p>${pciDetailsHtml}</p>
      <div>
    `;
    return actualResponse;
  }
}
