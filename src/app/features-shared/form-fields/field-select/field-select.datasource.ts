import { Observable } from 'rxjs';

import { McsOption } from '@app/models';

let nextUniqueId = 0;

export class FieldSelectConfig {
  constructor(public name: string, public noGutter?: boolean) { }
}

export abstract class FieldSelectDatasource {

  constructor(public config?: FieldSelectConfig) {
    if (!config) {
      config = new FieldSelectConfig((++nextUniqueId)?.toString());
    }
  }

  abstract initialize(option?: any): void;

  abstract connect(): Observable<McsOption[]>;

  abstract disconnect(): void;
}
