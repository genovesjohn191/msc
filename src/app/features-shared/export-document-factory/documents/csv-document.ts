import { Injector } from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import {
  isNullOrEmpty,
  CsvUtility
} from '@app/utilities';

import { IDashboardExportDocument } from '../dashboard-export-document-interface';

export class CsvDocument implements IDashboardExportDocument {
  private _authenticationIdentity: McsAuthenticationIdentity;

  public setInjector(injector: Injector): void {
    this._authenticationIdentity = injector.get(McsAuthenticationIdentity);
  }

  public exportDocument(itemDetails: Blob, docType: number, injector: Injector): void {
    this.setInjector(injector);
    if (isNullOrEmpty(itemDetails)) { return; }

    let data = itemDetails;
    let companyId = this._authenticationIdentity.user.companyId;
    let fileName = `${Date.now()}_${companyId}_BillSummary`;
    CsvUtility.generateCsvDocument(`${fileName}.csv`, data);
  }
}