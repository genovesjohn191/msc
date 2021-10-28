import { isNullOrUndefined } from '@app/utilities';
import { IDashboardExportDocument } from './dashboard-export-document-interface';
import { DashboardExportDocumentType } from './dashboard-export-document-type';
import { InsightsDocument } from './documents/insights-document';
import { OverviewDocument } from './documents/overview-document';
import { PrivateCloudDashboardOverviewDocument } from './documents/private-cloud-dashboard-overview-document';

export class DashboardExportDocumentManager {
  private _documentFactoriesMap: Map<DashboardExportDocumentType, IDashboardExportDocument>;
  constructor() {
    this._registerFactoryInstances();
  }

  public static initializeFactories(): DashboardExportDocumentManager {
    return new DashboardExportDocumentManager();
  }

  public getCreationFactory(exportType: DashboardExportDocumentType): IDashboardExportDocument {
    let factoryInstance = this._documentFactoriesMap.get(exportType);
    if (isNullOrUndefined(factoryInstance)) {
      throw new Error(`${exportType} was not defined on the factory context.`);
    }
    return factoryInstance;
  }

  private _registerFactoryInstances(): void {
    this._documentFactoriesMap = new Map();
    this._documentFactoriesMap.set(DashboardExportDocumentType.MsWordOverview, new OverviewDocument());
    this._documentFactoriesMap.set(DashboardExportDocumentType.MsWordInsights, new InsightsDocument());
    this._documentFactoriesMap.set(DashboardExportDocumentType.PdfOverview, new OverviewDocument());
    this._documentFactoriesMap.set(DashboardExportDocumentType.PdfInsights, new InsightsDocument());
    this._documentFactoriesMap.set(DashboardExportDocumentType.MsWordPrivateCloudDashboard, new PrivateCloudDashboardOverviewDocument());
    this._documentFactoriesMap.set(DashboardExportDocumentType.PdfPrivateCloudDashboard, new PrivateCloudDashboardOverviewDocument());
  }
}
