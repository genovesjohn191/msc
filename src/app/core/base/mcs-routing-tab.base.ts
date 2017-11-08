import {
  Router,
  ActivatedRoute,
  NavigationEnd
} from '@angular/router';
import {
  isNullOrEmpty
} from '../../utilities';

export abstract class McsRoutingTabBase<T> {

  public selectedRoutingTab: T;
  private _routerSubscription: any;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) {
    // We need to call this initially to select the active tab based on url
    this._setActiveTab();

    // Listen to any changed on the route to set the active tab aswell
    this._listenToRouteChanged();
  }

  protected abstract onTabChanged(_tab: any): void;

  /**
   * Dispose all of the resource from the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    if (!isNullOrEmpty(this._routerSubscription)) {
      this._routerSubscription.unsubscribe();
    }
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
