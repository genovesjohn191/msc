import {
  Directive,
  Input,
  AfterViewChecked
} from '@angular/core';
import { Router } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
import {
  isNullOrEmpty,
  compareArrays
} from '@app/utilities';

@Directive({
  selector: '[mcsRouterLink]',
  host: {
    '(click)': 'navigateToLink()',
    '[attr.href]': 'hrefUrl'
  }
})

export class RouterLinkDirective implements AfterViewChecked {
  public hrefUrl: string;

  @Input('mcsRouterLink')
  public set routerLinkKey(value: any[] | RouteKey | string) {
    Array.isArray(value) ?
      this._routerLinkKey = value :
      this._routerLinkKey.push(value);
  }
  private _routerLinkKey: any[] = [];
  private _previousRouterLink: any[];
  private _routerLink: string;

  constructor(private _router: Router) { }

  public ngAfterViewChecked() {
    Promise.resolve().then(() => {
      let comparisonResult = compareArrays(this._routerLinkKey, this._previousRouterLink);
      if (comparisonResult === 0) { return; }
      this._setRouterLink();
      this._previousRouterLink = Object.create(this._routerLinkKey);
    });
  }

  /**
   * Returns the router path/link
   */
  public get routeLink(): string {
    return this._routerLink;
  }

  /**
   * Navigates to the current link based on its definition
   */
  public navigateToLink(): boolean {
    if (isNullOrEmpty(this.routeLink)) {
      throw new Error(`Could not find the associated routerlink
        ${RouteKey[this.routeLink]}`);
    }
    this._router.navigate([this.routeLink]);
    return false;
  }

  /**
   * Returns the created router url
   */
  private _createRouterUrl(): string {
    let stringUrls: string[] = [];

    this._routerLinkKey.forEach((link) => {
      if (isNullOrEmpty(link)) { return; }

      let routeKey = (typeof link === 'string') ? RouteKey[link] : link;
      stringUrls.push(
        isNullOrEmpty(routeKey) ? link : CoreRoutes.getNavigationPath(routeKey)
      );
    });
    return this._router.createUrlTree(stringUrls).toString();
  }

  /**
   * Sets the router link
   */
  private _setRouterLink(): void {
    this._routerLink = this._createRouterUrl();
    this.hrefUrl = this._routerLink;
  }
}
