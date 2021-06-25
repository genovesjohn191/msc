import { Injector } from '@angular/core';
import {
 McsAccessControlService,
 McsDateTimeService
} from '@app/core';
import {
  McsContactUs,
  McsPermission,
  McsReportCostRecommendations,
  McsReportTopVmsByCost,
  McsTicket
} from '@app/models';
import {
  isNullOrEmpty,
  DocumentUtility,
  currencyFormat,
  HtmlToPdfUtility
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { OverviewDocumentDetails } from '../../overview/report-overview.document';
import { IDashboardExportDocument } from '../dashboard-export-document-interface';
import { DashboardExportDocumentType } from '../dashboard-export-document-type';

export class OverviewDocument implements IDashboardExportDocument {
  private _translateService: TranslateService;
  private _dateTimeService: McsDateTimeService;
  private _accessControlService: McsAccessControlService;

  public hasTicketViewPermission(): boolean {
    return this._accessControlService.hasPermission([McsPermission.TicketView]);
  }

  public setInjector(injector: Injector): void {
    this._translateService = injector.get(TranslateService);
    this._dateTimeService = injector.get(McsDateTimeService);
    this._accessControlService = injector.get(McsAccessControlService);
  }

  public exportDocument(itemDetails: OverviewDocumentDetails, docType: number, injector: Injector): void {
    this.setInjector(injector);
    if (isNullOrEmpty(itemDetails)) { return; }

    let overviewDetails = itemDetails;
    let htmlDocument = this._createHtmlDocument(overviewDetails);
    let fileName = `report-overview-${Date.now()}`;
    switch(docType) {
      case DashboardExportDocumentType.MsWordOverview:
        DocumentUtility.generateHtmlDocument(`${fileName}.docx`, htmlDocument);
        break;
      case DashboardExportDocumentType.PdfOverview:
        HtmlToPdfUtility.generateHtmlToPdf(`${fileName}.pdf`, htmlDocument, 'overview');
        break;
      default:
        break;
    }
  }

  private _createHtmlDocument(overviewDetails: OverviewDocumentDetails): string {
    if (isNullOrEmpty(overviewDetails)) { return ``; }

    let htmlString = `
      <div id="overview" style="padding: 5px 15px;">
        <h1>Overview</h1><br/>
        <div>
          ${this._createServiceCostOverviewHtml(overviewDetails)}
          ${this._createAzureResourcesHtml(overviewDetails)}
          <br style="page-break-before: always">
          ${this._createCostRecommendationHtml(overviewDetails.costRecommendation)}
          ${this._createContactUsHtml(overviewDetails.contactUs)}
          <br style="page-break-before: always">
          ${this._createResourceChangesHtml(overviewDetails)}
          ${this._createAzureTicketsHtml(overviewDetails.azureTickets)}
          ${this._createTopVmsByCostHtml(overviewDetails.topVms)}
        </div>
      </div>`;

    return htmlString;
  }

  private _createServiceCostOverviewHtml(overviewDetails: OverviewDocumentDetails): string {
    let title = this._translate('reports.overview.servicesOverviewWidget.title');
    let azureSubscriptionLabel = overviewDetails.azureSubscription === 1 ? 'subscription' : 'subscriptions';
    let widgetHtml = `<div>${overviewDetails.azureSubscription} Azure ${azureSubscriptionLabel}</div>`;
    let licenseSubscriptionLabel = overviewDetails.licenseSubscription === 1 ? 'subscription' : 'subscriptions';
    widgetHtml += `<div>${overviewDetails.licenseSubscription} License ${licenseSubscriptionLabel}</div><br/>`;

    let actualResponse = this._widgetHtml(widgetHtml, title);
    return actualResponse;
  }

  private _createAzureResourcesHtml(overviewDetails: OverviewDocumentDetails): string {
    let chartHtml = this._chartHtml(overviewDetails.azureResources);
    let title = this._translate('reports.overview.azureResourcesWidget.title');
    let actualResponse = this._widgetHtml(chartHtml, title);
    return actualResponse;
  }

  private _createCostRecommendationHtml(cost: McsReportCostRecommendations): string {
    let title = this._translate('reports.overview.costAndRecommendationsWidget.title');
    let actual = this._convertNumber(cost.actual);
    let budget = this._convertNumber(cost.budget);
    let costPercentage = budget === 0 ? 0 : Math.ceil((actual / budget) * 100);
    let barColor = this._getBgColorProgressBar(costPercentage);
    let barBgColor = costPercentage >= 85 ? '#ffe0b2' : '#c8e6c9';
    let costUpdatedOnDate =  !isNullOrEmpty(cost.updatedOn) ? this._formatDate(new Date(cost.updatedOn)) : '';
    let widgetHtml = `
      <h5>Actual vs Budget</h5>
      <table style="width: 50%; border-collapse: collapse;">
        <tr style="height: 10pt;">
          <td style="width: ${costPercentage}%; background-color: ${barColor}"></td>`;
          if (costPercentage < 100) {
            widgetHtml += `<td style="width: ${100 - costPercentage}%; background-color: ${barBgColor}"></td>`;
          }
      widgetHtml += `</tr>
        </table>
        <h6>${currencyFormat(actual)} / ${currencyFormat(budget)} (${costPercentage}%)</h6>
        <small>Refreshed ${costUpdatedOnDate}</small>

        <p><h5>Operational Monthly Savings</h5></p>
        <div>Up to ${currencyFormat(cost.potentialOperationalSavings)} could be saved by optimising underutilised resources.</div>
        <div>Up to ${currencyFormat(cost.potentialRightsizingSavings)} could be saved by rightsizing virtual machines.</div><br/>
      `;
    let actualResponse = this._widgetHtml(widgetHtml, title);
    return actualResponse;
  }

  private _createContactUsHtml(contactUs: McsContactUs[]): string {
    let title = `${this._translate('reports.overview.contactUsWidget.title')}`;
    let widgetHtml = '';
    contactUs.forEach((contact) => {
      widgetHtml += `<p>`;
        if (!isNullOrEmpty(contact.position)) {
          widgetHtml += `${contact.position}<br/>`;
        }
        if (!isNullOrEmpty(contact.firstName) || !isNullOrEmpty(contact.lastName)) {
          widgetHtml += `${contact.firstName} ${contact.lastName}<br/>`;
        }
        if (!isNullOrEmpty(contact.phone)) {
          widgetHtml += `${contact.phone}<br/>`;
        }
        if (!isNullOrEmpty(contact.email)) {
          widgetHtml += `${contact.email}`;
        }
      widgetHtml += `</p>`;
    })

    let actualResponse = this._widgetHtml(widgetHtml, title);
    return actualResponse;
  }

  private _createResourceChangesHtml(overviewDetails: OverviewDocumentDetails): string {
    let chartHtml = this._chartHtml(overviewDetails.resourceCount);
    let title = this._translate('reports.overview.resourceChangesWidget.title');
    let actualResponse = this._widgetHtml(chartHtml, title);
    return actualResponse;
  }

  private _createAzureTicketsHtml(data: McsTicket[]): string {
    let title = `${this._translate('reports.overview.azureTicketsWidget.title')}`;
    let ticketsTable = '';
    if (this.hasTicketViewPermission) {
      ticketsTable += `
        <table style="width: 100%">
          <tr style="background-color: #000; color: #FFF;">
            <th style="text-align: left">Summary</th>
            <th style="text-align: left">Last Updated Date</th>
          </tr>`;
          if (data?.length > 0) {
            data.forEach(item => {
              ticketsTable += `
                <tr style="text-align: left;">
                  <td>${item.shortDescription}</td>
                  <td>${this._formatDate(item.updatedOn, 'friendly')}</td>
                </tr>
              `;
            });
          }
      ticketsTable += `</table>`;
      if (data?.length === 0) {
        ticketsTable += `<p style="text-align: center">No open tickets.</p>`;
      }
    } else {
      ticketsTable += `<p style="text-align: center">${this._translate('reports.overview.azureTicketsWidget.noTicketViewPermission')}</p>`;
    }
    let actualResponse = this._widgetHtml(ticketsTable, title);
    return actualResponse;
  }

  private _createTopVmsByCostHtml(data: McsReportTopVmsByCost[]): string {
    let title = this._translate('reports.overview.topVmsByCostWidget.title');
    let subTitle = `${this._translate('reports.overview.topVmsByCostWidget.subTitle')}`
    let topVmsByCostTable = '';
    topVmsByCostTable += `
      <table style="width: 100%">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">VM Name</th>
          <th style="text-align: left">Total Cost</th>
          <th style="text-align: left">Total Hours</th>
          <th style="text-align: left">Reserved Hours</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            topVmsByCostTable += `
              <tr style="text-align: left;">
                <td>${item.vmName}</td>
                <td>$${item.totalCost}</td>
                <td>${item.totalHours}</td>
                <td>${item.reservedHours}</td>
              </tr>
            `;
          });
        }
        topVmsByCostTable += `</table>`;
        if (data?.length === 0) {
          topVmsByCostTable += `<p style="text-align: center">No VMs or no cost data to display.</p>`;
        }
    let actualResponse = this._widgetHtml(topVmsByCostTable, title, subTitle);
    return actualResponse;
  }

  private _widgetHtml(widget: string, title: string, subTitle?: string): string {
    let widgetHtml = (isNullOrEmpty(widget)) ? `<p>No data found</p>` : widget;
    let actualResponse =
      `<div>
        <h3>${title}</h3>
      `;
    if (subTitle) {
      actualResponse += `<p>${subTitle}</p>`;
    }
    actualResponse += `${widgetHtml}<div>`;
    return actualResponse;
  }

  private _chartHtml(uri: string, width?: string): string {
    let chartWidth = width ? width : '450';
    return (isNullOrEmpty(uri)) ? `<p>No data found</p>` : `<img src="${uri}" width="${chartWidth}">`;
  }

  private _getBgColorProgressBar(costPercentage: number): string {
    if (costPercentage > 100) {
      return '#FF0000';
    } else if (costPercentage >= 85) {
      return '#efc225';
    } else if (costPercentage === 0) {
      return '#c8e6c9';
    } else {
      return '#4caf50';
    }
  }

  private _translate(text: string): string { return this._translateService.instant(text); }

  private _formatDate(date: Date, format?: string): string {
    let dateFormat = isNullOrEmpty(format) ? 'default' : format;
    return this._dateTimeService.formatDate(date, dateFormat);
  }

  private _convertNumber(value: number): number {
    return value < 0 ? 0 : value;
  }
}