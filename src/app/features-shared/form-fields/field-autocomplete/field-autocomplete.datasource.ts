import { Observable } from 'rxjs';

import { McsOption } from '@app/models';

let nextUniqueId = 0;

export class FieldAutocompleteConfig {
  constructor(public name: string) { }
}

export abstract class FieldAutocompleteDatasource {

  constructor(public config?: FieldAutocompleteConfig) {
    if (!config) {
      config = new FieldAutocompleteConfig((++nextUniqueId)?.toString());
    }
  }

  abstract initialize(option?: any): void;

  abstract connect(): Observable<McsOption[]>;

  abstract disconnect(): void;

  abstract filterBy(option: McsOption, keyword: string): boolean;
}
