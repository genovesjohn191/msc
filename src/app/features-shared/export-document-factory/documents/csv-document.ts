import { Injector } from '@angular/core';
import {
  McsAuthenticationIdentity,
  McsCookieService
} from '@app/core';
import {
  isNullOrEmpty,
  CsvUtility,
  CommonDefinition
} from '@app/utilities';

import { IDashboardExportDocument } from '../dashboard-export-document-interface';

export class CsvDocument implements IDashboardExportDocument {
  private _authenticationIdentity: McsAuthenticationIdentity;
  private _cookieService: McsCookieService;

  public setInjector(injector: Injector): void {
    this._authenticationIdentity = injector.get(McsAuthenticationIdentity);
    this._cookieService = injector.get(McsCookieService);
  }

  public exportDocument(itemDetails: Blob, docType: number, injector: Injector): void {
    this.setInjector(injector);
    if (isNullOrEmpty(itemDetails)) { return; }

    let data = itemDetails;
    let originalCompanyId = this._authenticationIdentity.user?.companyId;
    let activeAccountCompanyId = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
    let companyId = activeAccountCompanyId? activeAccountCompanyId : originalCompanyId;
    let fileName = `${Date.now()}_${companyId}_BillSummary`;
    CsvUtility.generateCsvDocument(`${fileName}.csv`, data);
  }
}