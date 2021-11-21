import { Injector } from '@angular/core';
import { McsReportingService } from '@app/core';
import {
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import { compareDates } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

export const KEY_SEPARATOR = ':';
export const PROJECT_TEXT = '(Projected)';

export abstract class BillingOperationBase {
  protected readonly translate: TranslateService;
  protected readonly currencyPipe: StdCurrencyFormatPipe;
  protected readonly datePipe: StdDateFormatPipe;
  protected readonly reportingService: McsReportingService;

  constructor(
    injector: Injector
  ) {
    this.translate = injector.get(TranslateService);
    this.currencyPipe = injector.get(StdCurrencyFormatPipe);
    this.datePipe = injector.get(StdDateFormatPipe);
    this.reportingService = injector.get(McsReportingService);
  }

  protected isDateGreaterThanExpiry(timestamp: number): boolean {
    let novemberDate = new Date();
    novemberDate.setFullYear(2021, 10, 1);
    return compareDates(new Date(timestamp), novemberDate) !== -1;
  }
}
