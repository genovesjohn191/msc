import {
  takeUntil,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';

import { Injector } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { McsFilterPanel } from '@app/models';
import {
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';
import { PageService } from '@app/shared/page/page.service';

export class McsFilterPanelEvents implements McsDisposable {
  public filterPanelCollapsed$: Observable<boolean>;

  private readonly eventDispatcher: EventBusDispatcherService;
  private readonly pageService: PageService;
  private readonly destroySubject: Subject<void>;

  private _filterPanelToggleHandler: Subscription;
  private _filterPanelChange: BehaviorSubject<boolean>;

  constructor(injector: Injector) {
    this.eventDispatcher = injector.get<EventBusDispatcherService>(EventBusDispatcherService);
    this.pageService = injector.get<PageService>(PageService);

    this.destroySubject = new Subject<void>();
    this._filterPanelChange = new BehaviorSubject(null);

    this._filterPanelToggleHandler = this.eventDispatcher.addEventListener(
      McsEvent.filterPanelToggle, (panel: McsFilterPanel) => {
        let collapse = panel?.expanded === true ? false : true;
        this._filterPanelChange.next(collapse);
      });

    this.filterPanelCollapsed$ = this._filterPanelChange.pipe(
      takeUntil(this.destroySubject)
    );
  }

  public get filterPanelExpanded(): boolean {
    return this.pageService.leftPanelIsVisible;
  }

  public dispose(): void {
    unsubscribeSafely(this.destroySubject);
    unsubscribeSafely(this._filterPanelToggleHandler);
  }
}
