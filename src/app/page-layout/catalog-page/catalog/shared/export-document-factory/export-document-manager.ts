import { isNullOrUndefined } from '@app/utilities';

import { IExportDocument } from './export-document-interface';
import { ExportDocumentType } from './export-document-type';
import { WordProductDocument } from './word-dcouments/word-product-document';
import { WordSolutionDocument } from './word-dcouments/word-solution-document';

export class ExportDocumentManager {
  private _documentFactoriesMap: Map<ExportDocumentType, IExportDocument>;

  constructor() {
    this._registerFactoryInstances();
  }

  public static initializeFactories(): ExportDocumentManager {
    return new ExportDocumentManager();
  }

  public getCreationFactory(exportType: ExportDocumentType): IExportDocument {
    let factoryInstance = this._documentFactoriesMap.get(exportType);
    if (isNullOrUndefined(factoryInstance)) {
      throw new Error(`${exportType} was not defined on the factory context.`);
    }
    return factoryInstance;
  }

  private _registerFactoryInstances(): void {
    this._documentFactoriesMap = new Map();
    this._documentFactoriesMap.set(ExportDocumentType.MsWordProduct, new WordProductDocument());
    this._documentFactoriesMap.set(ExportDocumentType.MsWordSolution, new WordSolutionDocument());
  }
}
