import {
  AfterViewChecked,
  Attribute,
  Directive,
  ElementRef,
  Input,
  Renderer2
} from '@angular/core';
import { Router } from '@angular/router';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
import {
  coerceBoolean,
  compareArrays,
  isNullOrEmpty
} from '@app/utilities';

export interface IParamObject {
  [key: string]: any;
}

@Directive({
  selector: '[mcsRouterLink]',
  host: {
    '(click)': 'navigateToLink()',
    '[attr.href]': 'hrefUrl'
  }
})

export class RouterLinkDirective implements AfterViewChecked {
  public hrefUrl: string;

  @Input('mcsQueryParams')
  public queryParams: IParamObject;

  @Input('mcsReplaceUrl')
  public replaceUrl: boolean;

  @Input('mcsSkipLocationChange')
  public skipLocationChange: boolean;

  @Input('mcsRouterLink')
  public set routerLinkKey(value: any[] | RouteKey | string) {
    Array.isArray(value) ?
      this._routerLinkKey = value :
      this._routerLinkKey.push(value);
  }
  private _routerLinkKey: any[] = [];
  private _previousRouterLink: any[];
  private _routerLink: string;

  constructor(
    private _router: Router,
    @Attribute('tabindex') tabIndex: string,
    _renderer: Renderer2,
    _elementRef: ElementRef
  ) {
    if (tabIndex == null) {
      _renderer.setAttribute(_elementRef.nativeElement, 'tabindex', '0');
    }
  }

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

    let extras = {
      skipLocationChange: coerceBoolean(this.skipLocationChange),
      replaceUrl: coerceBoolean(this.replaceUrl),
    };
    this._router.navigateByUrl(this.routeLink, extras);
    return false;
  }

  /**
   * Returns the created router url
   */
  private _createRouterUrl(): string {
    let stringUrls: string[] = [];

    this._routerLinkKey.forEach((link) => {
      if (isNullOrEmpty(link)) { return; }

      let routeKey = link;
      if (typeof link === 'string') {
        let convertibleToIntId = !isNaN(+link);
        routeKey = convertibleToIntId ? null : RouteKey[link];
      }

      let hasDefinedNavigationPath = !isNullOrEmpty(routeKey);
      stringUrls.push(
        hasDefinedNavigationPath ? CoreRoutes.getNavigationPath(routeKey) : link
      );
    });
    return this._router.createUrlTree(stringUrls, {
      queryParams: this.queryParams
    }).toString();
  }

  /**
   * Sets the router link
   */
  private _setRouterLink(): void {
    this._routerLink = this._createRouterUrl();
    this.hrefUrl = this._routerLink;
  }
}
