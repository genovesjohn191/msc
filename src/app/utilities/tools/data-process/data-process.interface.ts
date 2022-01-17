import { Observable } from 'rxjs';

import { McsDisposable } from '../../interfaces/mcs-disposable.interface';

export interface IDataProcess<TError> extends McsDisposable {
  inProgress$: Observable<boolean>;
  onError$: Observable<TError[]>;
  onSuccess$: Observable<boolean>;
}
