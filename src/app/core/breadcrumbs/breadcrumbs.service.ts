import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/** Models */
import { Breadcrumb } from './breadcrumb';

@Injectable()
export class BreadcrumbsService {

  /** Item List */
  private _breadcrumbs: Breadcrumb[];

  /**
   * Subject<Event> Property for Updating item list
   */
  private _updateItemListEvent: Subject<Breadcrumb[]>;
  public get updateItemListEvent(): Subject<Breadcrumb[]> {
    return this._updateItemListEvent;
  }
  public set updateItemListEvent(val: Subject<Breadcrumb[]>) {
    this._updateItemListEvent = val;
  }

  constructor() {
    this._breadcrumbs = new Array();
    this._updateItemListEvent = new Subject<Breadcrumb[]>();
  }

  /**
   * Push/Add record
   * @param url Router URL
   * @param name Router Name
   */
  public push(breadcrumb: Breadcrumb) {
    // Add breadcrumb
    this._breadcrumbs.push(breadcrumb);
    // Set active route
    this._setActive();
    // Invoke Update Method
    this._updateItemListEvent.next(this.getBreadcrumbs());
  }

  /**
   * Pop/Remove last record
   */
  public pop() {
    this._breadcrumbs.pop();
    // Invoke Update Method
    this._updateItemListEvent.next(this.getBreadcrumbs());
  }

  /**
   * Clear all router items in the list
   */
  public clear() {
    this._breadcrumbs.length = 0;
    this._updateItemListEvent.next(this.getBreadcrumbs());
  }

  /**
   * Get router all list
   */
  public getBreadcrumbs(): Breadcrumb[] {
    return this._breadcrumbs;
  }

  private _setActive(): void {
    // Set the last list as active Route
    for (let idxRec = 0; idxRec < this._breadcrumbs.length; ++idxRec) {
      if (idxRec === (this._breadcrumbs.length - 1)) {
        this._breadcrumbs[idxRec].isActive = true;
      } else {
        this._breadcrumbs[idxRec].isActive = false;
      }
    }
  }
}
