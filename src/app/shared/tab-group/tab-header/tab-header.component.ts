import {
  Component,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  AfterContentChecked,
  OnDestroy,
  QueryList,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsViewportService
} from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../../utilities';
import { TabHeaderItemComponent } from './tab-header-item/tab-header-item.component';
import { TabBorderBarComponent } from '../tab-border-bar/tab-border-bar.component';

// Constants
const SCROLL_OFFSET = 60;

@Component({
  selector: 'mcs-tab-header',
  templateUrl: './tab-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-header-wrapper',
    '[class.tab-header-pagination-controls-enabled]': 'showPaginationControls'
  }
})

export class TabHeaderComponent implements AfterContentInit, AfterContentChecked, OnDestroy {

  @ViewChild(TabBorderBarComponent)
  public tabBorderBar: TabBorderBarComponent;

  @ViewChild('tabListContainer')
  public tabListContainer: ElementRef;

  @ViewChild('tabList')
  public tabList: ElementRef;

  @ContentChildren(TabHeaderItemComponent)
  public headerItems: QueryList<TabHeaderItemComponent>;

  public disableScrollAfter: boolean = true;
  public disableScrollBefore: boolean = true;
  public showPaginationControls: boolean = false;

  private _selectionSubscription: Subscription;
  private _viewportChangeSubscription: Subscription;
  private _scrollDistanceChanged: boolean;
  private _tabLabelCount: number;

  /**
   * Scroll distance to set when pagination is activated
   */
  private _scrollDistance: number = 0;
  public get scrollDistance(): number {
    return this._scrollDistance;
  }
  public set scrollDistance(value: number) {
    this._scrollDistance = Math.max(0, Math.min(this._getMaxScrollDistance(), value));
    this._scrollDistanceChanged = true;
    this._setPaginationControlStatus();
  }

  public get chevronRightKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_RIGHT;
  }

  public get chevronLeftKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _viewportService: McsViewportService
  ) { }

  public ngAfterContentInit(): void {
    if (this.headerItems) {
      this._listenToSelectionChange();
    }
    this._listenToViewportChange();
  }

  public ngAfterContentChecked(): void {
    // If the number of tab labels have changed, check if scrolling should be enabled
    if (this._tabLabelCount !== this.headerItems.length) {
      this._updatePagination();
      this._tabLabelCount = this.headerItems.length;
      this._changeDetectorRef.markForCheck();
    }

    // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
    // then translate the header to reflect this.
    if (this._scrollDistanceChanged) {
      this._updateTabScrollPosition();
      this._scrollDistanceChanged = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._selectionSubscription);
    unsubscribeSafely(this._viewportChangeSubscription);
  }

  /**
   * Scroll the header based on pagination button dispatched
   * @param direction Direction to set the scroll
   */
  public scrollHeader(direction: 'before' | 'after'): void {
    let viewLength = this.tabListContainer.nativeElement.offsetWidth;
    // Move the scroll distance one-third the length of the tab list's viewport.
    this.scrollDistance += (direction === 'before' ? -1 : 1) * viewLength / 3;
  }

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<TabHeaderItemComponent> {
    return Observable.merge(...this.headerItems.map((item) => item.selectionChanged));
  }

  /**
   * Determines what is the maximum length in pixels that can be set for the scroll distance. This
   * is equal to the difference in width between the tab list container and tab header container.
   */
  private _getMaxScrollDistance(): number {
    const lengthOfTabList = this.tabList.nativeElement.scrollWidth;
    const viewLength = this.tabListContainer.nativeElement.offsetWidth;
    return (lengthOfTabList - viewLength) || 0;
  }

  /**
   * Update the tab scroll position based on scroll distance
   */
  private _updateTabScrollPosition(): void {
    this._renderer.setStyle(this.tabList.nativeElement, 'transform',
      `translate3d(${-this.scrollDistance}px, 0, 0)`);
  }

  /**
   * Set the pagination status if it is enabled or disabled
   */
  private _setPaginationStatus() {
    let isEnabled =
      this.tabList.nativeElement.scrollWidth > this._elementRef.nativeElement.offsetWidth;

    if (!isEnabled) { this.scrollDistance = 0; }
    if (isEnabled !== this.showPaginationControls) {
      this._changeDetectorRef.markForCheck();
    }
    this.showPaginationControls = isEnabled;
  }

  /**
   * Set the pagination control status based on current scroll position
   */
  private _setPaginationControlStatus(): void {
    // Check if the pagination arrows should be activated.
    this.disableScrollBefore = this.scrollDistance === 0;
    this.disableScrollAfter = this.scrollDistance === this._getMaxScrollDistance();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the pagination of the header
   */
  private _updatePagination() {
    this._setPaginationStatus();
    this._setPaginationControlStatus();
    this._updateTabScrollPosition();
  }

  /**
   * Scroll tab header based on selected tab item
   * @param item Item to be scrolled
   */
  private _scrollToTabItem(item: TabHeaderItemComponent): void {
    if (isNullOrEmpty(item)) { return; }
    let labelBeforePos: number;
    let labelAfterPos: number;

    let viewLength = this.tabListContainer.nativeElement.offsetWidth;
    labelBeforePos = item.elementRef.nativeElement.offsetLeft;
    labelAfterPos = labelBeforePos + item.elementRef.nativeElement.offsetWidth;

    let beforeVisiblePos = this.scrollDistance;
    let afterVisiblePos = this.scrollDistance + viewLength;

    // Set the scroll distance based on the selected item
    if (labelBeforePos < beforeVisiblePos) {
      this.scrollDistance -= beforeVisiblePos - labelBeforePos + SCROLL_OFFSET;
    } else if (labelAfterPos > afterVisiblePos) {
      this.scrollDistance += labelAfterPos - afterVisiblePos + SCROLL_OFFSET;
    }
  }

  /**
   * Listen to selection changed of all the items
   */
  private _listenToSelectionChange(): void {
    this._selectionSubscription = this.itemsSelectionChanged.subscribe((item) => {
      if (this.showPaginationControls) {
        this._scrollToTabItem(item);
      }
      this.tabBorderBar.alignToElement(item.elementRef.nativeElement);
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Listen to viewport resize change
   */
  private _listenToViewportChange(): void {
    this._viewportChangeSubscription = this._viewportService.change()
      .subscribe(() => {
        this._updatePagination();
      });
  }
}
