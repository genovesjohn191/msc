import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  AfterContentInit,
  AfterContentChecked,
  OnDestroy,
  ContentChildren,
  QueryList,
  ViewChild
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  CoreDefinition,
  McsViewportService
} from '../../core';
import {
  unsubscribeSafely,
  isNullOrEmpty
} from '../../utilities';
import {
  ResponsivePanelBarComponent
} from './responsive-panel-bar/responsive-panel-bar.component';
import {
  ResponsivePanelItemDirective
} from './responsive-panel-item/responsive-panel-item.directive';

// Constants
const SCROLL_OFFSET = 60;

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-responsive-panel',
  templateUrl: './responsive-panel.component.html',
  styleUrls: ['./responsive-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'responsive-panel-wrapper',
    '[class.responsive-panel-pagination-controls-enabled]': 'showPaginationControls',
    '[attr.id]': 'id'
  }
})

export class ResponsivePanelComponent implements AfterContentInit, AfterContentChecked, OnDestroy {

  @Input()
  public id: string = `mcs-responsive-panel-${nextUniqueId++}`;

  @ViewChild('panelItemsMainContainer')
  public panelItemsMainContainer: ElementRef;

  @ViewChild('panelItemsSubContainer')
  public panelItemsSubContainer: ElementRef;

  @ViewChild(ResponsivePanelBarComponent)
  public panelBorderBar: ResponsivePanelBarComponent;

  @ContentChildren(ResponsivePanelItemDirective)
  public panelItems: QueryList<ResponsivePanelItemDirective>;

  public disableScrollAfter: boolean = true;
  public disableScrollBefore: boolean = true;
  public showPaginationControls: boolean = false;

  private _selectionSubscription: Subscription;
  private _viewportChangeSubscription: Subscription;
  private _scrollDistanceChanged: boolean;
  private _panelItemsCount: number;

  public get chevronRightKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_RIGHT;
  }

  public get chevronLeftKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

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

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<ResponsivePanelItemDirective> {
    return Observable.merge(...this.panelItems.map((item) => item.select));
  }

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _viewportService: McsViewportService
  ) { }

  public ngAfterContentInit(): void {
    // We need to listen to changes on header
    // in order to cater the scenarios of dynamic adding of tab
    if (this.panelItems) { this._listenToSelectionChange(); }
    this.panelItems.changes.subscribe(() => {
      this._listenToSelectionChange();
    });
    this._listenToViewportChange();
  }

  public ngAfterContentChecked(): void {
    // If the number of action items have changed, check if scrolling should be enabled
    if (this._panelItemsCount !== this.panelItems.length) {
      this._updatePagination();
      this._panelItemsCount = this.panelItems.length;
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
    let viewLength = this.panelItemsMainContainer.nativeElement.offsetWidth;
    // Move the scroll distance one-third the length of the tab list's viewport.
    this.scrollDistance += (direction === 'before' ? -1 : 1) * viewLength / 3;
  }

  /**
   * Determines what is the maximum length in pixels that can be set for the scroll distance. This
   * is equal to the difference in width between the tab list container and tab header container.
   */
  private _getMaxScrollDistance(): number {
    const lengthOfTabList = this.panelItemsSubContainer.nativeElement.scrollWidth;
    const viewLength = this.panelItemsMainContainer.nativeElement.offsetWidth;
    return (lengthOfTabList - viewLength) || 0;
  }

  /**
   * Update the tab scroll position based on scroll distance
   */
  private _updateTabScrollPosition(): void {
    this._renderer.setStyle(this.panelItemsSubContainer.nativeElement, 'transform',
      `translate3d(${-this.scrollDistance}px, 0, 0)`);
  }

  /**
   * Set the pagination status if it is enabled or disabled
   */
  private _setPaginationStatus() {
    let isEnabled = this.panelItemsSubContainer.nativeElement.scrollWidth >
      this._elementRef.nativeElement.offsetWidth;

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
  private _scrollToElement(item: ResponsivePanelItemDirective): void {
    if (isNullOrEmpty(item)) { return; }
    let labelBeforePos: number;
    let labelAfterPos: number;

    let viewLength = this.panelItemsMainContainer.nativeElement.offsetWidth;
    labelBeforePos = item.elementRef.offsetLeft;
    labelAfterPos = labelBeforePos + item.elementRef.offsetWidth;

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
        this._scrollToElement(item);
      }
      if (item.selectable) {
        this.panelBorderBar.alignToElement(item.elementRef);
      }
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
