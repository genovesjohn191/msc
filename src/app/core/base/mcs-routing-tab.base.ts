import {
  Router,
  ActivatedRoute,
  ParamMap,
  NavigationEnd
} from '@angular/router';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';

export abstract class McsRoutingTabBase<T> {

  // Outside variables
  public selectedRoutingTab: T;
  public paramId: string;

  // Subscription
  private _routerSubscription: any;
  private _parameterSubscription: any;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) { }

  protected abstract onTabChanged(_tab: any): void;
  protected abstract onParamIdChanged(_id: string): void;

  /**
   * Initializes all based implementation
   */
  protected onInit(): void {
    // We need to call this initially to select the active tab based on url
    this._setActiveTab();

    // Listen to any changed on the route and params to set the active tab aswell
    this._listenToRouteChanged();
    this._listenToParamChanged();
  }

  /**
   * Dispose all of the resource from the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected onDestroy(): void {
    unsubscribeSafely(this._routerSubscription);
    unsubscribeSafely(this._parameterSubscription);
  }

  /**
   * Listener for router changed to set the tab selection
   */
  private _listenToRouteChanged(): void {
    this._routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._setActiveTab();
      }
    });
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
   * Set the active based on routing URL
   */
  private _setActiveTab(): void {
    if (isNullOrEmpty(this.activatedRoute.children)) { return; }
    this.activatedRoute.children.forEach((activeRoute) => {
      activeRoute.url.subscribe((urls) => {
        let urlSegment = urls[0];
        if (!isNullOrEmpty(urlSegment)) {
          let segmentUrl: any = urlSegment.path;
          this.selectedRoutingTab = segmentUrl as T;
        }
      });
    });
  }
}
