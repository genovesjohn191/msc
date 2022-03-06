import { Subject } from 'rxjs';

import {
  Component,
  Injector
} from '@angular/core';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({ template: '' })
export abstract class McsPageBase implements McsDisposable {
  protected readonly translate: TranslateService;
  protected readonly apiService: McsApiService;
  protected readonly destroySubject: Subject<void>;

  constructor(protected injector: Injector) {
    this.destroySubject = new Subject<void>();
    this.translate = injector.get<TranslateService>(TranslateService);
    this.apiService = injector.get<McsApiService>(McsApiService);
  }

  public dispose(): void {
    unsubscribeSafely(this.destroySubject);
  }
}
