import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsRouteInfo } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';

/**
 * @deprecated Use the view listing base
 */
export abstract class McsRoutingTabBase<T> {
  public selectedRoutingTab: T;
  public paramId: string;

  private _routerHandler: any;
  private _parameterSubscription: any;

  constructor(
    protected eventDispatcher: EventBusDispatcherService,
    protected activatedRoute: ActivatedRoute
  ) { }

  protected onInit(): void {
    this._listenToRouteChanged();
    this._listenToParamChanged();
  }

  protected onDestroy(): void {
    unsubscribeSafely(this._routerHandler);
    unsubscribeSafely(this._parameterSubscription);
  }

  protected abstract onTabChanged(_tab: any): void;
  protected abstract onParamIdChanged(_id: string): void;

  /**
   * Listener for router changed to set the tab selection
   */
  private _listenToRouteChanged(): void {
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChange.bind(this));

    this.eventDispatcher.dispatch(McsEvent.routeChange);
  }

  /**
   * Listener for parameter changed events
   */
  private _listenToParamChanged(): void {
    this._parameterSubscription = this.activatedRoute.paramMap
      .subscribe((params: ParamMap) => {
        this.paramId = params.get('id');
        this.onParamIdChanged(this.paramId);
      });
  }

  /**
   * Event that emits when the route has been changed
   * @param routeInfo Route information
   */
  private _onRouteChange(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }
    this.selectedRoutingTab = routeInfo.routePath as any;
  }
}
