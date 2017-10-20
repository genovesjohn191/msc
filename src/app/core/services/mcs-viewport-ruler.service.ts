import { Injectable } from '@angular/core';
import { McsScrollDispatcherService } from './mcs-scroll-dispatcher.service';

@Injectable()
export class McsViewportRulerService {

  private _documentRect?: ClientRect;

  constructor(private scrollDispatcher: McsScrollDispatcherService) {
    // Subscribe to scroll and resize events and update the document rectangle on changes.
    this.scrollDispatcher.scrolled(0, () => this._cacheViewportGeometry());
  }

  /**
   * Gets a ClientRect for the viewport's bounds
   * @param documentRect Document Rectangular
   */
  public getViewportRect(documentRect = this._documentRect): ClientRect {
    // Cache the document bounding rect so that we don't recompute it for multiple calls.
    if (!documentRect) {
      this._cacheViewportGeometry();
      documentRect = this._documentRect;
    }

    let scrollPosition = this.getViewportScrollPosition(documentRect);
    let height = window.innerHeight;
    let width = window.innerWidth;

    return {
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
      height,
      width,
    };
  }

  /**
   * Gets the (top, left) scroll position of the viewport.
   * @param documentRect
   */
  public getViewportScrollPosition(documentRect = this._documentRect) {
    // Cache the document bounding rect so that we don't recompute it for multiple calls.
    if (!documentRect) {
      this._cacheViewportGeometry();
      documentRect = this._documentRect;
    }

    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    let top = -documentRect!.top || document.body.scrollTop || window.scrollY ||
      document.documentElement.scrollTop || 0;

    let left = -documentRect!.left || document.body.scrollLeft || window.scrollX ||
      document.documentElement.scrollLeft || 0;

    return { top, left };
  }

  /**
   * Viewport geometry to handle the rectangular part of the browser
   */
  private _cacheViewportGeometry(): void {
    this._documentRect = document.documentElement.getBoundingClientRect();
  }
}
