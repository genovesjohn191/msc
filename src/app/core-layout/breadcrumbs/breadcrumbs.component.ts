import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';

/** Service */
import { BreadcrumbsService } from './breadcrumbs.service';

/** Models */
import { Breadcrumb } from './breadcrumb';

@Component({
  selector: 'mcs-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: Breadcrumb[];
  private _breadcrumbEventHandler: any;
  private _routerEventHandler: any;

  public constructor(
    private _router: Router,
    private _breadcrumbsService: BreadcrumbsService
  ) {
    this.breadcrumbs = new Array();
  }

  public ngOnInit() {
    /** Add Event Invoker whenever the data is changed */
    this._breadcrumbEventHandler = this._breadcrumbsService.updateItemListEvent
      .subscribe((item) => {
        this._onChangeItemList(item);
      });

    /** Register Event for Route Activation */
    this._routerEventHandler = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.onNavigateEnd(event);
        }
      });
  }

  public ngOnDestroy() {
    if (this._breadcrumbEventHandler) {
      this._breadcrumbEventHandler.unsubscribe();
    }
    if (this._routerEventHandler) {
      this._routerEventHandler.unsubscribe();
    }
  }

  public onNavigateTo(url: string): void {
    this._router.navigateByUrl(url);
  }

  public onNavigateEnd(navEnd: NavigationEnd) {
    let relativeUrl: string = '';
    let urlPaths: string[];

    this._breadcrumbsService.clear();
    // Set Split URL
    urlPaths = navEnd.urlAfterRedirects.split('/').slice(1);

    // Create path url
    for (let url of urlPaths) {
      let name: string;

      if (!url) { continue; }
      relativeUrl += '/' + url;
      name = url[0].toUpperCase() + url.slice(1);
      this._breadcrumbsService.push(new Breadcrumb(relativeUrl, name));
    }
  }

  private _onChangeItemList(updatedList: Breadcrumb[]) {
    this.breadcrumbs = updatedList;
  }
}
