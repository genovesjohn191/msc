import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  ContentChildren,
  QueryList,
  ViewChild,
  NgZone
} from '@angular/core';
import {
  Observable,
  Subject,
  merge,
  defer
} from 'rxjs';
import {
  startWith,
  takeUntil,
  take,
  switchMap
} from 'rxjs/operators';
import {
  McsViewportService,
  McsUniqueId
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import {
  ResponsivePanelBarComponent
} from './responsive-panel-bar/responsive-panel-bar.component';
import {
  ResponsivePanelItemDirective
} from './responsive-panel-item/responsive-panel-item.directive';

// Constants
const SCROLL_OFFSET = 60;

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

export class ResponsivePanelComponent implements AfterViewInit, AfterViewChecked, OnDestroy {

  @Input()
  public id: string = McsUniqueId.NewId('responsive-panel');

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

  private _scrollDistanceChanged: boolean;
  private _destroySubject = new Subject<void>();

  public get chevronRightKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_RIGHT;
  }

  public get chevronLeftKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
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
   * Returns all the combined selection changes event of all the panel items
   */
  private readonly _itemsClickEvents: Observable<ResponsivePanelItemDirective> = defer(() => {
    if (!isNullOrEmpty(this.panelItems)) {
      return merge<ResponsivePanelItemDirective>(
        ...this.panelItems.map((panelItem) => panelItem.clickChange)
      );
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._itemsClickEvents)
    );
  });

  constructor(
    private _ngZone: NgZone,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _viewportService: McsViewportService
  ) { }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.panelItems.changes
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => {
          this._updatePagination();
          this._subscribeToClickEvents();
          this._initializeSelection();
        });
    });
    this._subscribeToViewportChange();
  }

  public ngAfterViewChecked(): void {
    // If the scroll distance has been changed (tab selected, focused, scroll controls activated),
    // then translate the header to reflect this.
    if (this._scrollDistanceChanged) {
      this._updateTabScrollPosition();
      this._scrollDistanceChanged = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
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
    Promise.resolve().then(() => {
      this._setPaginationStatus();
      this._setPaginationControlStatus();
      this._updateTabScrollPosition();
    });
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
  private _subscribeToClickEvents(): void {
    let resetSubject = merge(this.panelItems.changes, this._destroySubject);

    this._itemsClickEvents.pipe(takeUntil(resetSubject)).subscribe((selectedItem) => {
      if (isNullOrEmpty(selectedItem)) { return; }
      this._clearSelectedPanels();
      this._selectReponsivePanelItem(selectedItem);
    });
  }

  /**
   * Initialize responsive panel item selection
   */
  private _initializeSelection(): void {
    if (isNullOrEmpty(this.panelItems)) { return; }
    let selectedItemFound = this.panelItems.find((item) => item.selected);
    if (!isNullOrEmpty(selectedItemFound)) { return; }

    let firstItem = this.panelItems.first;
    if (!isNullOrEmpty(firstItem)) {
      firstItem.onClick();
    }
  }

  /**
   * Clears the selected panel items
   */
  private _clearSelectedPanels(): void {
    if (isNullOrEmpty(this.panelItems)) { return; }
    this.panelItems.forEach((panel) => panel.deselect());
  }

  /**
   * Select the responsive panel item
   */
  private _selectReponsivePanelItem(selectedPanel: ResponsivePanelItemDirective): void {
    selectedPanel.select();
    if (this.showPaginationControls) { this._scrollToElement(selectedPanel); }

    if (selectedPanel.selectable) {
      this.panelBorderBar.alignToElement(selectedPanel.elementRef);
    }
  }

  /**
   * Listen to viewport resize change
   */
  private _subscribeToViewportChange(): void {
    this._viewportService.change()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._updatePagination());
  }
}
