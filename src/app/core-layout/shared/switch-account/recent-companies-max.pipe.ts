import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { McsCompany } from '@app/models';

// Maximum recent companies
const MAX_RECENT_COMPANIES = 3;

@Pipe({
  name: 'mcsRecentCompaniesMax',
  pure: false
})

export class RecentCompaniesMaxPipe implements PipeTransform {
  public transform(_value: McsCompany[], ..._args: any[]): any {
    return _value ? _value.slice(0, MAX_RECENT_COMPANIES) : undefined;
  }
}
