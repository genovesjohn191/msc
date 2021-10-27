import { Injector } from '@angular/core';
import {
 McsAccessControlService,
 McsAuthenticationIdentity,
 McsDateTimeService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { IDashboardExportDocument } from '@app/features-shared/export-document-factory/dashboard-export-document-interface';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';
import {
  McsContactUs,
  McsPermission,
  McsReportComputeResourceTotals,
  McsReportStorageResourceUtilisation,
  McsTicket
} from '@app/models';
import { DataSizePipe } from '@app/shared/pipes/data-size.pipe';
import {
  isNullOrEmpty,
  DocumentUtility,
  HtmlToPdfUtility
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { PrivateCloudDashboardOverviewDocumentDetails } from './private-cloud-dashboard-overview';

export class PrivateCloudDashboardOverviewDocument implements IDashboardExportDocument {
  private _translateService: TranslateService;
  private _dateTimeService: McsDateTimeService;
  private _accessControlService: McsAccessControlService;
  private _authenticationIdentity: McsAuthenticationIdentity;
  private _eventDispatcher: EventBusDispatcherService;
  private _dataSize: DataSizePipe;

  public hasTicketViewPermission(): boolean {
    return this._accessControlService.hasPermission([McsPermission.TicketView]);
  }

  public get hasAccessToCloudVm(): boolean {
    return this._accessControlService.hasPermission([McsPermission.CloudVmAccess]);
  }

  public get hasAccessToOrganizationView(): boolean {
    return this._accessControlService.hasPermission([McsPermission.OrganizationVdcView]);
  }

  public get hasAccessToFirewall(): boolean {
    return this._accessControlService.hasPermission([McsPermission.FirewallConfigurationView]);
  }

  public setInjector(injector: Injector): void {
    this._translateService = injector.get(TranslateService);
    this._dateTimeService = injector.get(McsDateTimeService);
    this._accessControlService = injector.get(McsAccessControlService);
    this._authenticationIdentity = injector.get(McsAuthenticationIdentity);
    this._eventDispatcher = injector.get(EventBusDispatcherService);
    this._dataSize = injector.get(DataSizePipe);
  }

  public exportDocument(
    itemDetails: PrivateCloudDashboardOverviewDocumentDetails,
    docType: number,
    injector: Injector): void {
    this.setInjector(injector);
    if (isNullOrEmpty(itemDetails)) { return; }

    let overviewDetails = itemDetails;
    let htmlDocument = this._createHtmlDocument(overviewDetails, docType);
    let fileName = `private-cloud-overview-${Date.now()}`;
    switch(docType) {
      case DashboardExportDocumentType.MsWordPrivateCloudDashboard:
        DocumentUtility.generateHtmlDocument(`${fileName}.docx`, htmlDocument);
        break;
      case DashboardExportDocumentType.PdfPrivateCloudDashboard:
        HtmlToPdfUtility.generateHtmlToPdf(
          `${fileName}.pdf`, htmlDocument, 'Private Cloud Overview', this._authenticationIdentity, this._eventDispatcher);
        break;
      default:
        break;
    }
  }

  private _createHtmlDocument(overviewDetails: PrivateCloudDashboardOverviewDocumentDetails, docType: number): string {
    if (isNullOrEmpty(overviewDetails)) { return ``; }
    let documentTitle = docType === DashboardExportDocumentType.MsWordPrivateCloudDashboard ? `<h1>Private Cloud Overview</h1>` : '';
    let htmlString = `
      <div id="private-cloud-overview" style="padding: 5px 15px;">
        ${documentTitle}
        <div>
          ${this._createServiceCostOverviewHtml(overviewDetails.servicesOverview)}
          ${this._createStorageUtilisationHtml(overviewDetails.resourceStorageUtilisation)}
          ${this._createAzureTicketsHtml(overviewDetails.tickets)}
          ${this._createContactUsHtml(overviewDetails.contactUs)}
        </div>
      </div>`;

    return htmlString;
  }

  private _createServiceCostOverviewHtml(resource: McsReportComputeResourceTotals): string {
    if (this.hasAccessToCloudVm || this.hasAccessToFirewall) {
      let widgetHtml = '';
      let title = this._translate('label.servicesOverview');
      if (this.hasAccessToCloudVm) {
        widgetHtml += `
          <div>${this._resourceDescription('Server', resource.serverCount)}</div><br/>`;
      }
      if (this.hasAccessToOrganizationView) {
        widgetHtml += `
          <div>${this._resourceDescription('VDC', resource.vdcCount)}</div><br/>`;
      }
      if (this.hasAccessToFirewall) {
        widgetHtml += `
          <div>${this._resourceDescription('Firewall', resource.firewallCount)}</div><br/>`;
      }
      let actualResponse = this._widgetHtml(widgetHtml, false, title);
      return actualResponse;
    }
    return '';
  }

  private _createStorageUtilisationHtml(data: McsReportStorageResourceUtilisation[]): string {
    if (this.hasAccessToOrganizationView) {
      let title = this._translate('label.storageProfileUtilisation');
      let storageTable = '';
      storageTable += `
        <table style="width: 100%" data-pdfmake="{'headerRows':1}">
          <tr style="background-color: #000; color: #FFF;">
            <th style="text-align: left">Storage Profile</th>
            <th style="text-align: left">Resource</th>
            <th style="text-align: left">Utilisation</th>
          </tr>`;
          if (data?.length > 0) {
            data.forEach(row => {
              storageTable += `
                <tr style="text-align: left;">
                  <td>${row.name}</td>
                  <td>${row.resourceName}</td>
                  <td>
                  <div style="text-align: center; color: ${this._getColor(row.usedMB, row.limitMB)}">
                    ${this._getUtilisationPercentage(row.usedMB, row.limitMB)}%
                  </div>`
                if (!isNullOrEmpty(row.usedMB)) {
                  storageTable +=`<span>(${this._dataSize.transform(row.usedMB, 'MB')}`
                } else {
                  storageTable +=`<span>(Unavailable`
                }
                storageTable +=` / ${this._dataSize.transform(row.limitMB, 'MB')})</span>
                  </td>
                </tr>
              `;
            });
          };
          storageTable += `</table>`;
          if (data?.length === 0) {
            storageTable += `<p>${this._translate('message.noStorageProfileUtilisation')}</p>`;
          }
      let actualResponse = this._widgetHtml(storageTable, false, title);
      return actualResponse;
    }
    return '';
  }

  private _createAzureTicketsHtml(data: McsTicket[]): string {
    let title = `${this._translate('label.openPrivateCloudTickets')}`;
    let ticketsTable = '';
    if (this.hasTicketViewPermission) {
      ticketsTable += `
        <table style="width: 100%" data-pdfmake="{'headerRows':1}">
          <tr style="background-color: #000; color: #FFF;">
            <th style="text-align: left">Summary</th>
            <th style="text-align: left">Last Updated Date</th>
          </tr>`;
          if (data?.length > 0) {
            data.forEach(item => {
              ticketsTable += `
                <tr style="text-align: left;">
                  <td style="white-space: pre-wrap;">${item.shortDescription}</td>
                  <td>${this._formatDate(item.updatedOn, 'friendly')}</td>
                </tr>
              `;
            });
          }
      ticketsTable += `</table>`;
      if (data?.length === 0) {
        ticketsTable += `<p>No open tickets.</p>`;
      }
    } else {
      ticketsTable += `<p>${this._translate('reports.overview.azureTicketsWidget.noTicketViewPermission')}</p>`;
    }
    let actualResponse = this._widgetHtml(ticketsTable, false, title);
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

    let actualResponse = this._widgetHtml(widgetHtml, false, title);
    return actualResponse;
  }

  private _widgetHtml(widget: string, pageBreak: boolean, title: string, subTitle?: string): string {
    let widgetHtml = (isNullOrEmpty(widget)) ? `<p>No data found</p>` : widget;
    let withPageBreak = pageBreak ? 'class="pdf-pagebreak-before"' : '';
    let actualResponse =
      `<div>
        <h3 ${withPageBreak}>${title}</h3>
      `;
    if (subTitle) {
      actualResponse += `<p>${subTitle}</p>`;
    }
    actualResponse += `${widgetHtml}<div>`;
    return actualResponse;
  }

  private _translate(text: string): string { return this._translateService.instant(text); }

  private _formatDate(date: Date, format?: string): string {
    let dateFormat = isNullOrEmpty(format) ? 'default' : format;
    return this._dateTimeService.formatDate(date, dateFormat);
  }

  private _resourceDescription(label: string, resourceCount: number = 0): string {
    let description = `${resourceCount} ${label}`;
    return resourceCount === 1 ? description : `${description}s`;
  }

  private _getColor(usedMb: number, limitMb: number): string {
    let usage = Number(this._getUtilisationPercentage(usedMb, limitMb));
    if (usage > 85) {
      return 'red';
    } else if(usage > 75 && usage <= 85) {
      return 'darkorange';
    }
    return 'green';
  }

  private _getUtilisationPercentage(usedMb: number, limitMb: number): string {
    let firstValue = usedMb < 0 ? 0 : usedMb;
    let secondValue = limitMb < 0 ? 0 : limitMb;
    let percentage = 100 * firstValue / secondValue;
    let utilisationPercentage = isNaN(percentage) ? 0 : percentage;
    return utilisationPercentage.toFixed(1);
  }
}