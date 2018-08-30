import {
  Directive,
  Input,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsRouteKey,
  CoreRoutes
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Directive({
  selector: 'a[mcsRouterLink]',
  host: {
    '(click)': 'navigateToLink()',
    '[attr.href]': 'hrefUrl'
  }
})

export class RouterLinkDirective implements OnInit {
  public hrefUrl: string;

  @Input('mcsRouterLink')
  public set routerLinkKey(value: any[] | McsRouteKey | string) {
    Array.isArray(value) ?
      this._routerLinkKey = value :
      this._routerLinkKey.push(value);
  }
  private _routerLinkKey: any[] = [];
  private _routerLink: string;

  constructor(private _router: Router) { }

  public ngOnInit() {
    this._routerLink = this._createRouterUrl();
    this.hrefUrl = this._routerLink;
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
        ${McsRouteKey[this.routeLink]}`);
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
      stringUrls.push(
        (typeof link === 'string') ?
          link : CoreRoutes.getNavigationPath(link)
      );
    });
    return this._router.createUrlTree(stringUrls).toString();
  }
}
