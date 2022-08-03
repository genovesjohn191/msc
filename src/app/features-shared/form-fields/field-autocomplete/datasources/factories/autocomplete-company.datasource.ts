import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  McsCompany,
  McsOption
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import {
  FieldAutocompleteConfig,
  FieldAutocompleteDatasource
} from '../../field-autocomplete.datasource';
import { FieldAutocompletePrerequisite } from '../field-autocomplete.prerequisite';

export class AutocompleteCompanyDatasource extends FieldAutocompleteDatasource {
  private _destroySubject = new Subject();
  private _dataOptionsChange = new BehaviorSubject<McsOption[]>(null);

  constructor(private _apiService: McsApiService) {
    super(new FieldAutocompleteConfig('autocomplete-company'));
  }

  public initialize(_prerequisite?: FieldAutocompletePrerequisite<Observable<string>>): void {
    let dataOptions = this._dataOptionsChange.getValue();
    if (!isNullOrEmpty(dataOptions)) { return; }

    this._apiService.getCompanies().pipe(
      tap(response => {
        let companies = response?.collection || [];
        let optionItems = companies.map(company => new McsOption(company.id, company.name, null, false, company, null, `(${company.id})`));
        this._dataOptionsChange.next(optionItems);
      })
    ).subscribe();
  }

  public connect(): Observable<McsOption[]> {
    return this._dataOptionsChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public filterBy(option: McsOption, keyword: string): boolean {
    let companyData = option.data as McsCompany;
    if (isNullOrEmpty(companyData)) { return false; }

    return companyData.id?.toLowerCase().includes(keyword) ||
      companyData.name?.toLowerCase().includes(keyword);
  }
}