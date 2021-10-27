import { Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsDateTimeService
} from '@app/core';
import {
  McsFeatureFlag,
  McsReportAscAlerts,
  McsReportAuditAlerts,
  McsReportInefficientVms,
  McsReportOperationalSavings,
  McsReportSecurityScore,
  McsReportUpdateManagement,
  McsReportVMRightsizing
} from '@app/models';
import {
  isNullOrEmpty,
  DocumentUtility,
  currencyFormat,
  coerceNumber,
  HtmlToPdfUtility
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { IDashboardExportDocument } from '@app/features-shared/export-document-factory/dashboard-export-document-interface';
import { InsightsDocumentDetails } from '../insights/report-insights-document';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';

const cloudhealthText = 'reports.insights.vmCloudHealthLink';

export class InsightsDocument implements IDashboardExportDocument {
  private _translateService: TranslateService;
  private _dateTimeService: McsDateTimeService;
  private _authenticationIdentity: McsAuthenticationIdentity;
  private _eventDispatcher: EventBusDispatcherService;
  private _accessControlService: McsAccessControlService;

  public get hasAccessToAscAlertsListing(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.AscAlert]);
  }

  public setInjector(injector: Injector): void {
    this._translateService = injector.get(TranslateService);
    this._dateTimeService = injector.get(McsDateTimeService);
    this._authenticationIdentity = injector.get(McsAuthenticationIdentity);
    this._eventDispatcher = injector.get(EventBusDispatcherService);
    this._accessControlService = injector.get(McsAccessControlService);
  }

  public exportDocument(itemDetails: InsightsDocumentDetails, docType: number, injector: Injector): void {
    this.setInjector(injector);
    if (isNullOrEmpty(itemDetails)) { return; }

    let insightDetails = itemDetails;
    let htmlDocument = this._createHtmlDocument(insightDetails, docType);
    let fileName = `report-insights-${Date.now()}`;

    switch(docType) {
      case DashboardExportDocumentType.MsWordInsights:
        DocumentUtility.generateHtmlDocument(`${fileName}.docx`, htmlDocument);
        break;
      case DashboardExportDocumentType.PdfInsights:
        HtmlToPdfUtility.generateHtmlToPdf(
          `${fileName}.pdf`, htmlDocument, 'Insights', this._authenticationIdentity, this._eventDispatcher);
        break;
      default:
        break;
    }
  }

  private _createHtmlDocument(insightDetails: InsightsDocumentDetails, docType: number): string {
    if (isNullOrEmpty(insightDetails)) { return ``; }
    let documentTitle = docType === DashboardExportDocumentType.MsWordInsights ? `<h1>Insights</h1>` : '';
    let htmlString = `
      <div id="insights" style="padding: 5px 15px;">
        ${documentTitle}
        <p>${this._translate('reports.insights.subtitle')} ${this._translate(cloudhealthText)}</p>
        <div>
          <h2 style="color: #00bed8;">Costs</h2>
          ${this._createServiceCostOverviewHtml(insightDetails)}
          ${this._createMonthlyCostHtml(insightDetails)}
          ${this._createVirtualMachineBreakdownHtml(insightDetails)}
          ${this._createOperationalMonthlyHtml(insightDetails.operationalSavings)}
          ${this._createVmRightSizingHtml(insightDetails.vmRightsizing, insightDetails.vmCost)}
          ${this._createInefficientVmsHtml(insightDetails.inefficientVms)}
        </div>`;

        if (insightDetails.hasManagementService) {
          htmlString += `
            <div>
              <h2 style="color: #00bed8;">Tech Review</h2>
              ${this._createSecurityHtml(insightDetails.securityScore)}
              ${this._createComplianceHtml(insightDetails)}
              ${this._createResourceHealthHtml(insightDetails)}
              ${this._createPerformanceScalabilityHtml(insightDetails)}
              ${this._createMonitoringAlertingHtml(insightDetails)}
              ${this._createAscAlertsHtml(insightDetails.ascAlerts)}
              ${this._createAuditAlertsHtml(insightDetails.auditAlerts)}
              ${this._createUpdateManagementHtml(insightDetails.updateManagement)}
            </div>`;
        }
    htmlString += `</div>`;

    return htmlString;
  }

  private _createServiceCostOverviewHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.serviceCost);
    let title = this._translate('reports.insights.costs.serviceOverview.title');
    let subTitle = `The historical costs ${this._translate('reports.insights.costs.serviceOverview.subTitle')}`;
    let actualResponse = this._widgetHtml(chartHtml, false, title, subTitle);
    return actualResponse;
  }

  private _createMonthlyCostHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.monthlyCostUri);
    let title = `${this._translate('reports.insights.costs.resourceCost.title')} ${insightDetails.monthlyCostselectedMonth}`;
    let subTitle = `The total cost ${this._translate('reports.insights.costs.resourceCost.subTitle')}`;
    let actualResponse = this._widgetHtml(chartHtml, true, title, subTitle);
    return actualResponse;
  }

  private _createVirtualMachineBreakdownHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.vmBreakdown);
    let title = this._translate('reports.insights.costs.vmBreakdown.title');
    let subTitle = `The number of virtual machines ${this._translate('reports.insights.costs.vmBreakdown.subTitle')}`;
    let actualResponse = this._widgetHtml(chartHtml, true, title, subTitle);
    return actualResponse;
  }

  private _createOperationalMonthlyHtml(insightDetails: McsReportOperationalSavings): string {
    let title = this._translate('reports.insights.costs.operationalSavings.title');
    let subTitle = `
        ${this._translate('reports.insights.costs.operationalSavings.subTitle')}
        <p>${this._translate('reports.insights.costs.operationalSavings.labelBelowChart')} ${this._translate(cloudhealthText)}</p>`;
    let hasSavings  = insightDetails?.totalSavings > 0 ? true : false;
    let operationalTable = '';
    if (hasSavings) {
      operationalTable += `
        <p>
          Up to <strong>${currencyFormat(insightDetails.totalSavings)}</strong> could be saved by optimising underutilised resources.
        </p>
        <table style="border-collapse: collapse; width: 100%">`;
        if (insightDetails.items?.length > 0) {
          insightDetails.items.forEach(item => {
            if (!isNullOrEmpty(item.savings)) {
              operationalTable += `
                <tr>
                  <th style="text-align: left; background-color: #f0f0f0; padding: 5px; color: #000;"><h4>${item.description}</h4></th>
                  <th style="text-align: right; background-color: #f0f0f0; padding: 5px; color: #000;"><h4>${currencyFormat(item.savings)}</h4></th>
                </tr>
              `;
              item.subItems.forEach(subItem => {
                operationalTable += `
                  <tr>
                    <td>${subItem.description}</td>
                    <td style="text-align: right;">${currencyFormat(subItem.savings)}</td>
                  </tr>
                `;
              });
            }
          });
        }
        operationalTable += `</table>`;
    } else {
      operationalTable = `
        <div>${this._translate('reports.insights.costs.operationalSavings.noVirtualMachine')}</div>
        <div>${this._translate('reports.insights.costs.operationalSavings.noSQLdatabase')}</div><br/>`
    }
    let actualResponse = this._widgetHtml(operationalTable, true, title, subTitle);
    return actualResponse;
  }

  private _createVmRightSizingHtml(data: McsReportVMRightsizing[], vmCost: string): string {
    let title = this._translate('reports.insights.costs.vmRightsizing.title');
    let subTitle = `
      ${this._translate('reports.insights.costs.vmRightsizing.subTitle')}
      <p>${this._translate('reports.insights.costs.vmRightsizing.labelBelowChart')}
         Virtual Machine Rightsizing statistics provided by ${this._translate(cloudhealthText)}</p>
      <p>Up to <strong>${vmCost}</strong> could be saved by rightsizing virtual machines.</p>`
    let vmRightSizingTable = '';
    vmRightSizingTable += `
      <table style="width: 100%" data-pdfmake="{'headerRows':1}">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">VM Name</th>
          <th style="text-align: left">Size</th>
          <th style="text-align: left">Region</th>
          <th style="text-align: left">Recommendation</th>
          <th style="text-align: left; white-space: pre-wrap;">Projected Compute Cost </th>
          <th style="text-align: left; white-space: pre-wrap;">Possible Savings</th>
          <th style="text-align: left; white-space: pre-wrap;">CPU Score</th>
          <th style="text-align: left; white-space: pre-wrap;">Memory Score</th>
          <th style="text-align: left; white-space: pre-wrap;">Disk Score</th>
          <th style="text-align: left">Efficiency</th>
          <th style="text-align: left; white-space: pre-wrap;">Total Score</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            vmRightSizingTable += `
              <tr style="text-align: left; white-space: pre-wrap;">
                <td>${item.vmName}</td>
                <td>${item.size}</td>
                <td>${item.region}</td>
                <td>${item.recommendation}</td>
                <td>${item.projectedComputeCost}</td>
                <td>${item.recommendationSavings}</td>
                <td>${item.cpuScore}</td>
                <td>${item.memoryScore}</td>
                <td>${item.diskScore}</td>
                <td>${item.efficiency ? item.efficiency : 'No Data'}</td>
                <td>${item.totalScore}</td>
              </tr>
            `;
          });
        }
        vmRightSizingTable += `</table>`;
        if (data?.length === 0) {
          vmRightSizingTable += `<p>No data found</p>`;
        }
    let actualResponse = this._widgetHtml(vmRightSizingTable, false, title, subTitle);
    return actualResponse;
  }

  private _createInefficientVmsHtml(data: McsReportInefficientVms[]): string {
    let title = this._translate('reports.insights.costs.inefficientVms.title');
    let subTitle = `${this._translate('reports.insights.costs.inefficientVms.subTitle')}
      <p>${this._translate('reports.insights.costs.inefficientVms.secondSubtitle')} ${this._translate(cloudhealthText)}</p>`;
    let inefficientVmsTable = '';
    inefficientVmsTable += `
      <table style="width: 100%" data-pdfmake="{'headerRows':1}">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">VM Name</th>
          <th style="text-align: left">Efficiency Index</th>
          <th style="text-align: left">Size</th>
          <th style="text-align: left">Utilization this Month (Hours)</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            inefficientVmsTable += `
              <tr style="text-align: left;">
                <td>${item.vmName}</td>
                <td>${item.efficiency}</td>
                <td>${item.size}</td>
                <td>${item.totalHours}</td>
              </tr>
            `;
          });
        }
        inefficientVmsTable += `</table>`;
        if (data?.length === 0) {
          inefficientVmsTable += `<p>No data found</p>`;
        }
    let actualResponse = this._widgetHtml(inefficientVmsTable, false, title, subTitle);
    return actualResponse;
  }

  private _createSecurityHtml(security: McsReportSecurityScore): string {
    let title = this._translate('reports.insights.techReview.security.title');
    let subTitle = `<h4>${this._translate('reports.insights.techReview.security.overAllSecurityScore')}</h4>
        Azure Security Center ${this._translate('reports.insights.techReview.security.subTitle')}
    `;
    let widgetHtml = '';
    if (!isNullOrEmpty(security)) {
      let securePercentage = this._getPercentage(security.currentScore, security.maxScore);
      let barColor = this._getBgColorProgressBar(securePercentage);
      let progressBarWidth = securePercentage > 100 ? 100 : securePercentage;
      widgetHtml =`<span style="font-size: 24pt">
          <strong>${this._convertNumber(security.currentScore)}</strong> / ${this._convertNumber(security.maxScore)}
        </span>
        <table style="width: 27%; border-collapse: collapse;" data-pdfmake="{'layout': 'noBorders'}">
          <tr style="height: 6pt; width: auto;">
            <td style="width: ${progressBarWidth}%; background-color: ${barColor}"></td>`;
            if (securePercentage < 100) {
              widgetHtml += `<td style="width: ${100 - securePercentage}%; background-color: #b2ebf2"></td>`;
            }
            widgetHtml += `</tr>
        </table><br/>
      `;
    }
    let actualResponse = this._widgetHtml(widgetHtml, false, title, subTitle);
    return actualResponse;
  }

  private _createComplianceHtml(insightDetails: InsightsDocumentDetails): string {
    let title = this._translate('reports.insights.techReview.compliance.title');
    let subTitle = `An overarching compliance view ${this._translate('reports.insights.techReview.compliance.subTitle')}`
    let widgetHtml = '';
    if (!isNullOrEmpty(insightDetails.compliance)) {
      let compliance = insightDetails.compliance;
      let compliancePercentage = compliance.resourceCompliancePercentage <= 0
        ? 0 : coerceNumber(compliance.resourceCompliancePercentage.toFixed());
      let barColor = this._getBgColorProgressBar(compliancePercentage);
      let progressBarWidth = compliancePercentage > 100 ? 100 : compliancePercentage;
      widgetHtml = `
        <h4>Overall Resource Compliance</h4>
        <span style="font-size: 24pt"><strong>${this._convertNumber(compliance.resourceCompliancePercentage)}%</strong></span>
        <table style="width: 27%; border-collapse: collapse;" data-pdfmake="{'layout': 'noBorders'}">
          <tr style="height: 6pt;">
            <td style="width: ${progressBarWidth}%; background-color: ${barColor}"></td>`;
            if (compliancePercentage < 100) {
              widgetHtml += `<td style="width: ${100 - compliancePercentage}%; background-color: #b2ebf2"></td>`;
            }
          widgetHtml += `</tr>
        </table>
        <span>${compliance.compliantResources} of ${compliance.totalResources}</span>
        <br/>
        <h4 style="padding-top: 10px;">Resources by Compliance State</h4>
        ${this._chartHtml(insightDetails.complianceUri, '400', '120')}

        <h4 style="padding-top: 10px;">Non-compliant Initiatives</h4>
        <span><strong style="font-size: 24pt">${compliance.nonCompliantInitiatives}</strong> out of ${compliance.totalInitiatives}</span>

        <h4 style="padding-top: 15px;">Non-compliant Policies</h4>
        <span><strong style="font-size: 24pt">${compliance.nonCompliantPolicies}</strong> out of ${compliance.totalPolicies}</span>
      `;
    }
    let actualResponse = this._widgetHtml(widgetHtml, false, title, subTitle);
    return actualResponse;
  }

  private _createResourceHealthHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.resourceHealth, null, '350');
    let title = this._translate('reports.insights.techReview.resourceHealth.title');
    let subTitle = `${this._translate('reports.insights.techReview.resourceHealth.subTitle')} Azure Security Center.`;
    let actualResponse = this._widgetHtml(chartHtml, true, title, subTitle);
    return actualResponse;
  }

  private _createPerformanceScalabilityHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.performanceScalability);
    let title = this._translate('reports.insights.techReview.performanceScalability.title');
    let subTitle = `A summary of aggregate VM memory, file system and CPU usage ${this._translate('reports.insights.costs.vmBreakdown.subTitle')}`;
    let actualResponse = this._widgetHtml(chartHtml, true, title, subTitle);
    return actualResponse;
  }

  private _createMonitoringAlertingHtml(insightDetails: InsightsDocumentDetails): string {
    let chartHtml = this._chartHtml(insightDetails.monitoringAlerting);
    let title = this._translate('reports.insights.techReview.monitoringAlerting.title');
    let subTitle = `A count of Azure Monitor alerts ${this._translate('reports.insights.techReview.monitoringAlerting.subTitle')}
      <p>
        <strong>Total Alerts</strong><br/>
        <span style="font-size: 25px; color: #0a97e5;">${insightDetails.totalAlerts}</span>
      </p>`;
    let actualResponse = this._widgetHtml(chartHtml, true, title, subTitle);
    return actualResponse;
  }

  private _createAscAlertsHtml(data: McsReportAscAlerts[]):string {
    if (!this.hasAccessToAscAlertsListing) { return ''; }
    let title = this._translate('reports.insights.techReview.ascAlerts.title');
    let subTitle = `
      ${this._translate('reports.insights.techReview.ascAlerts.subTitle')}
      <p>${this._translate('reports.insights.techReview.ascAlerts.secondSubtitle')}
        ${this._translate('reports.insights.techReview.ascAlerts.ticketLabel')}
        ${this._translate('reports.insights.techReview.ascAlerts.secondSubtitleContinuation')}
      </p>`;
    let ascAlertsTable = '';
    ascAlertsTable += `
      <table style="width: 100%" data-pdfmake="{'headerRows':1}">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">Severity</th>
          <th style="text-align: left">Description</th>
          <th style="text-align: left">Affected Resource</th>
          <th style="text-align: left">Start Time</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            ascAlertsTable += `
              <tr style="text-align: left;">
                <td>${item.severity ? item.severity : 'Unavailable'}</td>
                <td>${item.description ? item.description : 'Unavailable'}</td>
                <td>${item.affectedResource ? item.affectedResource : 'Unavailable'}</td>
                <td>${this._formatDate(item.startTime)}</td>
              </tr>`;
          });
        }
        ascAlertsTable += `</table>`;
        if (data?.length === 0) {
          ascAlertsTable += `<p>${this._translate('reports.insights.techReview.ascAlerts.noDataFound')}</p>`;
        }
    let actualResponse = this._widgetHtml(ascAlertsTable, true, title, subTitle);
    return actualResponse;
  }

  private _createAuditAlertsHtml(data: McsReportAuditAlerts[]): string {
    let title = this._translate('reports.insights.techReview.auditAlerts.title');
    let subTitle = `
      ${this._translate('reports.insights.techReview.auditAlerts.subTitle')}`;
    let auditAlertsTable = '';
    auditAlertsTable += `
      <table style="width: 100%" data-pdfmake="{'headerRows':1}">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">Severity</th>
          <th style="text-align: left">Type</th>
          <th style="text-align: left">Operation Name</th>
          <th style="text-align: left">Time</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            auditAlertsTable += `
              <tr style="text-align: left;">
                <td>${item.severity}</td>
                <td>${item.type}</td>
                <td>${item.operationName ? item.operationName : 'Unavailable'}</td>
                <td>${this._formatDate(item.occurredOn)}</td>
              </tr>`;
          });
        }
        auditAlertsTable += `</table>`;
        if (data?.length === 0) {
          auditAlertsTable += `<p>No data found</p>`;
        }
    let pageBreak = !this.hasAccessToAscAlertsListing ? true : false;
    let actualResponse = this._widgetHtml(auditAlertsTable, pageBreak, title, subTitle);
    return actualResponse;
  }

  private _createUpdateManagementHtml(data: McsReportUpdateManagement[]): string {
    let title = this._translate('reports.insights.techReview.updateManagement.title');
    let subTitle = `${this._translate('reports.insights.techReview.updateManagement.subTitle')}`
    let updateManagementTable = '';
    updateManagementTable += `
      <table style="border-collapse: collapse; width: 100%" data-pdfmake="{'headerRows':1}">
        <tr style="background-color: #000; color: #FFF;">
          <th style="text-align: left">Target VM</th>
          <th style="text-align: left">OS Type</th>
          <th style="text-align: left">Subscription</th>
          <th style="text-align: left">Resource Group</th>
          <th style="text-align: left">Last Start Time</th>
          <th style="text-align: left">Last End Time</th>
          <th style="text-align: left">Last Status</th>
        </tr>`;
        if (data?.length > 0) {
          data.forEach(item => {
            updateManagementTable += `
              <tr style="text-align: left;">
                <td>${item.targetComputer ? item.targetComputer : 'Unavailable'}</td>
                <td>${item.osType ? item.osType : 'Unavailable'}</td>
                <td>${item.subscription ? item.subscription : 'Unavailable'}</td>
                <td>${item.resourceGroup ? item.resourceGroup : 'Unavailable'}</td>
                <td style="white-space: pre-wrap;">${this._formatDate(item.lastStartTime)}</td>
                <td style="white-space: pre-wrap;">${this._formatDate(item.lastEndTime)}</td>
                <td>${item.lastStatus}</td>
              </tr>`;
          });
        }
        updateManagementTable += `</table>`;
        if (data?.length === 0) {
          updateManagementTable += `<p>No data found</p>`;
        }
    let actualResponse = this._widgetHtml(updateManagementTable, false, title, subTitle);
    return actualResponse;
  }

  private _widgetHtml(widget: string, pageBreak: boolean, title: string, subTitle?: string): string {
    let widgetHtml = (isNullOrEmpty(widget)) ? `<p style="text-align: left;">No data found</p>` : widget;
    let actualResponse = '';
    let withPageBreak = pageBreak ? 'class="pdf-pagebreak-before"' : '';
    actualResponse += `<div><h3 ${withPageBreak}>${title}</h3>`;
    if (subTitle) {
      actualResponse += `<p>${subTitle}</p>`;
    }
    actualResponse += `${widgetHtml}</div>`;
    return actualResponse;
  }

  private _chartHtml(uri: string, width?: string, height?: string): string {
    let chartWidth = width ? width : '860';
    let chartHeight = height ? height : '505';
    return (isNullOrEmpty(uri)) ? `<p style="text-align: left;">No data found</p>` :
      `<img src="${uri}" width="${chartWidth}" height="${chartHeight}">`;
  }

  private _translate(text: string): string { return this._translateService.instant(text); }

  private _formatDate(date: Date): string {
    return this._dateTimeService.formatDate(date, 'default');
  }

  private _convertNumber(value: number): number {
    return value < 0 ? 0 : Number(value.toFixed());;
  }

  private _getPercentage(num1: number, num2: number): number {
    return num2 === 0 ? 0 : Math.ceil((num1 / num2) * 100);
  }

  private _getBgColorProgressBar(costPercentage): string {
    return costPercentage === 0 ? '#b2ebf2' : '#00bcd4';
  }
}