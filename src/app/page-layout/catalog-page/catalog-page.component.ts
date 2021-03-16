import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { McsEvent } from '@app/events';
import { McsIdentity } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';

@Component({
  selector: 'mcs-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogPageComponent implements OnInit, OnDestroy {
  public isAnonymous$: Observable<boolean>;

  private _anonymousFlagChange = new BehaviorSubject<boolean>(false);
  private _destroySubject = new Subject<void>();

  constructor(private _eventDispatcher: EventBusDispatcherService) {
    this._registerEvents();
  }

  public ngOnInit(): void {
    this._eventDispatcher.dispatch(McsEvent.userChange);
    this._subscribeToAnonymousFlagChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));
  }

  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    this._anonymousFlagChange.next(user.isAnonymous);
  }

  private _subscribeToAnonymousFlagChange(): void {
    this.isAnonymous$ = this._anonymousFlagChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged()
    );
  }
}
