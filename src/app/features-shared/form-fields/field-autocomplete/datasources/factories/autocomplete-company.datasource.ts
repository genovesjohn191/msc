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
  McsOption,
  McsQueryParam
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
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
    this._updateDataRecords();
  }

  public connect(): Observable<McsOption[]> {
    return this._dataOptionsChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  public disconnect(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public filterRecords(keyword: string): void {
    this._updateDataRecords(keyword);
  }

  private _updateDataRecords(keyword?: string): void {
    let query = new McsQueryParam();
    query.pageIndex = CommonDefinition.PAGE_INDEX_DEFAULT;
    query.pageSize = CommonDefinition.PAGE_SIZE_MIN;
    query.keyword = keyword;

    this._apiService.getCompanies(query).pipe(
      tap(response => {
        let companies = response?.collection || [];
        let optionItems = companies.map(company => new McsOption(company.id, company.name, null, false, company, null, ` (${company.id})`));
        this._dataOptionsChange.next(optionItems);
      })
    ).subscribe();
  }
}