import { CoreRoutes } from '@app/core';
import {
  McsCatalogSolution,
  RouteKey
} from '@app/models';
import {
  isNullOrEmpty,
  DocumentUtility
} from '@app/utilities';

import { CatalogItemDetails } from '../../catalog-item-details';
import { IExportDocument } from '../export-document-interface';

export class WordSolutionDocument implements IExportDocument {

  public exportDocument(itemDetails: CatalogItemDetails): void {
    if (isNullOrEmpty(itemDetails)) { return; }

    let solutionDetails = itemDetails.data as McsCatalogSolution;
    let htmlDocument = this._createHtmlDocument(solutionDetails);
    let fileName = `${solutionDetails.name}-${Date.now()}`;
    DocumentUtility.generateHtmlDocument(`${fileName}.docx`, htmlDocument);
  }

  private _createHtmlDocument(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails)) { return ``; }

    let htmlString = `
      <div>
        <h1>${solutionDetails.name}</h1>
        <p>v<small>${solutionDetails.version}</small></p>
      </div>

      <div>
        <h2>All Information</h2>
        <p>${solutionDetails.shortDescription}</p>
      </div>

      ${this._createUseCaseHtml(solutionDetails)}
      ${this._createDescriptionHtml(solutionDetails)}
      ${this._createBenefitsAndLimitationsHtml(solutionDetails)}
      ${this._createIncludedProductsHtml(solutionDetails)}
      ${this._createLocationsHtml(solutionDetails)}
    `;

    return htmlString;
  }

  private _createUseCaseHtml(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails.useCases)) { return ``; }
    let useCasesHtml = '';

    solutionDetails.useCases?.forEach(useCase => {
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

  private _createDescriptionHtml(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails.description)) { return ``; }

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Description</h2>
        <p>${solutionDetails.description}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createBenefitsAndLimitationsHtml(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails.benefitsAndLimitations)) { return ``; }

    let benefitsAndLimitationTable = `
    <table>
      <tr>
        <th style="text-align: left;">Benefits/Advantages</th>
        <th style="text-align: left;">Limitations/Disadvantages</th>
      </tr>
    `;

    solutionDetails.benefitsAndLimitations.forEach(item => {
      benefitsAndLimitationTable += `
      <tr>
        <td>${item.benefit}</td>
        <td>${item.limitation}</td>
      </tr>
      `;
    });
    benefitsAndLimitationTable += `</table>`;

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Benefits and Limitations</h2>
        <p>${benefitsAndLimitationTable}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createIncludedProductsHtml(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails.includedProducts)) { return ``; }
    let includedProductsHtml = '';

    let solutionCatalogPath = CoreRoutes.getRouteInfoByKey(RouteKey.CatalogSolution);
    solutionDetails.includedProducts.forEach(dependent => {
      let dependencyPath = `${window.location.origin}/${solutionCatalogPath}/${dependent.id}`
      includedProductsHtml += `<p><a href="${dependencyPath}">${dependent.name}</a></p>`;
    });

    let actualResponse = `
      <div class="product-catalog-item">
        <h2>Included Products</h2>
        <p>${includedProductsHtml}</p>
      <div>
    `;
    return actualResponse;
  }

  private _createLocationsHtml(solutionDetails: McsCatalogSolution): string {
    if (isNullOrEmpty(solutionDetails.locations)) { return ``; }
    let locationsHtml = '';

    solutionDetails.locations.forEach(location => {
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
}
