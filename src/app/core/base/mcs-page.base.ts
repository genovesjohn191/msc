import { Subject } from 'rxjs';

import {
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsStateNotification,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { FormMessageComponent } from '@app/shared';
import {
  isNullOrEmpty,
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

  @ViewChild(FormMessageComponent)
  private _formMessageRef: FormMessageComponent;

  constructor(protected injector: Injector) {
    this.destroySubject = new Subject<void>();
    this.translate = injector.get<TranslateService>(TranslateService);
    this.apiService = injector.get<McsApiService>(McsApiService);
    this.eventDispatcher = injector.get<EventBusDispatcherService>(EventBusDispatcherService);
    this.changeDetector = injector.get<ChangeDetectorRef>(ChangeDetectorRef);
    this.activatedRoute = injector.get<ActivatedRoute>(ActivatedRoute);
    this.navigation = injector.get<McsNavigationService>(McsNavigationService);
  }

  public abstract get featureName(): string;

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public dispose(): void {
    unsubscribeSafely(this.destroySubject);
  }

  public refreshAngularView(): void {
    this.changeDetector.markForCheck();
  }

  public showSuccessfulMessage(message: string): void {
    this.eventDispatcher.dispatch(McsEvent.stateNotificationShow,
      new McsStateNotification('success', message)
    );
  }

  public showErrorMessage(message: string, tryAgainFunc?: () => void): void {
    this.eventDispatcher.dispatch(McsEvent.stateNotificationShow,
      new McsStateNotification('error', message, tryAgainFunc));
  }

  public showErrorBannerMessage(...errors: string[]): void {
    if (isNullOrEmpty(errors) || isNullOrEmpty(this._formMessageRef)) { return; }

    let translatedErrors = errors.map(error => this.translate.instant(error));
    this._formMessageRef.showMessage('error', {
      messages: translatedErrors
    });
  }

  public hideErrorBanner(): void {
    this._formMessageRef?.hideMessage();
  }
}
