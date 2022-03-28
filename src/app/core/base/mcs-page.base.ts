import { Subject } from 'rxjs';

import {
  ChangeDetectorRef,
  Component,
  Injector
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { RouteKey } from '@app/models';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { McsNavigationService } from '../services/mcs-navigation.service';

@Component({ template: '' })
export abstract class McsPageBase implements McsDisposable {
  protected readonly translate: TranslateService;
  protected readonly apiService: McsApiService;
  protected readonly destroySubject: Subject<void>;
  protected readonly eventDispatcher: EventBusDispatcherService;
  protected readonly changeDetector: ChangeDetectorRef;
  protected readonly activatedRoute: ActivatedRoute;
  protected readonly navigation: McsNavigationService;

  constructor(protected injector: Injector) {
    this.destroySubject = new Subject<void>();
    this.translate = injector.get<TranslateService>(TranslateService);
    this.apiService = injector.get<McsApiService>(McsApiService);
    this.eventDispatcher = injector.get<EventBusDispatcherService>(EventBusDispatcherService);
    this.changeDetector = injector.get<ChangeDetectorRef>(ChangeDetectorRef);
    this.activatedRoute = injector.get<ActivatedRoute>(ActivatedRoute);
    this.navigation = injector.get<McsNavigationService>(McsNavigationService);
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public dispose(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public refreshAngularView(): void {
    this.changeDetector.markForCheck();
  }
}
