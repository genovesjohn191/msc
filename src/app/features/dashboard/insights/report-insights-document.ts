import {
  McsReportAuditAlerts,
  McsReportInefficientVms,
  McsReportOperationalSavings,
  McsReportResourceCompliance,
  McsReportSecurityScore,
  McsReportUpdateManagement,
  McsReportVMRightsizing
} from '@app/models';

export class InsightsDocumentDetails {
  public serviceCost: string;
  public monthlyCostUri: string;
  public monthlyCostselectedMonth: string;
  public vmBreakdown: string;
  public performanceScalability: string;
  public monitoringAlerting: string;
  public resourceHealth: string;
  public operationalSavings: McsReportOperationalSavings;
  public vmRightsizing: McsReportVMRightsizing[];
  public vmCost: string;
  public inefficientVms: McsReportInefficientVms[];
  public securityScore: McsReportSecurityScore;
  public compliance: McsReportResourceCompliance;
  public complianceUri: string;
  public auditAlerts: McsReportAuditAlerts[];
  public totalAlerts: number;
  public updateManagement: McsReportUpdateManagement[];
  public hasManagementService: boolean;
}