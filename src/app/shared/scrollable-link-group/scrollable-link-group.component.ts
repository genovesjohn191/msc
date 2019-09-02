import {
  Component,
  Output,
  OnDestroy,
  EventEmitter,
  ViewChildren,
  ContentChildren,
  QueryList,
  AfterViewInit,
  AfterContentInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil,
  distinctUntilChanged
} from 'rxjs/operators';
import { McsScrollDispatcherService } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { ScrollableLinkComponent } from './scrollable-link/scrollable-link.component';
import {
  ScrollableLinkHeaderComponent
} from './scrollable-link-header/scrollable-link-header.component';
import { ScrollableLinkGroup } from './scrollable-link-group.interface';

const DEFAULT_SCROLL_TOP_OFFSET = 50;

@Component({
  selector: 'mcs-scrollable-link-group',
  templateUrl: './scrollable-link-group.component.html',
  styleUrls: ['./scrollable-link-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'scrollable-link-group-wrapper'
  }
})

export class ScrollableLinkGroupComponent implements ScrollableLinkGroup, AfterViewInit, AfterContentInit, OnDestroy {
  @Output()
  public change = new EventEmitter<any>();

  @ContentChildren(ScrollableLinkComponent)
  public scrollableLinks: QueryList<ScrollableLinkComponent>;

  @ViewChildren(ScrollableLinkHeaderComponent)
  private _scrollableHeaders: QueryList<ScrollableLinkHeaderComponent>;

  private _activatedLinkByScrollChange = new Subject<ScrollableLinkComponent>();
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcherService: McsScrollDispatcherService
  ) { }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._scrollableHeaders.changes.pipe(
        startWith(null), takeUntil(this._destroySubject)
      ).subscribe(() => {
        this._initializeSelection();
        this._hideSingleScrollLinkLabel();
      });

      this._subscribeToScrollUpdate();
      this._subscribeToActivatedLinkByScrollChange();
    });
  }

  public ngAfterContentInit(): void {
    this.scrollableLinks.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Resets the scrollable link group
   */
  public reset(): void {
    if (isNullOrEmpty(this.scrollableLinks)) { return; }
    this._selectLink(this.scrollableLinks.first);
    this._selectScrollHeader(this.scrollableLinks.first);
  }

  /**
   * Returns true when the scrollable element has only more than 1 link
   */
  public get hasMultipleLinks(): boolean {
    return this.scrollableLinks.length > 1;
  }

  /**
   * Event that emits when the link was clicked manually
   * @param link Clicked link to be set
   */
  public onClickLink(link: ScrollableLinkComponent): void {
    this._selectLink(link);
    link.scrollIntoView();
  }

  /**
   * Selects the link based on the provided link component
   * @param link Scrollable link to be selected
   */
  private _selectLink(link: ScrollableLinkComponent): void {
    if (isNullOrEmpty(link)) { return; }
    this.change.emit(link);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the initial selection of the tab component
   */
  private _initializeSelection(): void {
    if (isNullOrEmpty(this.scrollableLinks)) { return; }
    this._selectLink(this.scrollableLinks.first);
  }

  /**
   * Hides the label of the scrollable link when it has a single record
   */
  private _hideSingleScrollLinkLabel(): void {
    if (isNullOrEmpty(this.scrollableLinks)) { return; }
    Promise.resolve().then(() => {
      this.hasMultipleLinks ?
        this.scrollableLinks.first.showLabel() :
        this.scrollableLinks.first.hideLabel();
    });
  }
  /**
   * Subscribe to scroll update location
   */
  private _subscribeToScrollUpdate(): void {
    let scrollableContainer = this._scrollDispatcherService.getScrollableParentContainer(
      this.scrollableLinks.first.hostElement
    );
    if (isNullOrEmpty(scrollableContainer)) { return; }

    // Listen for every scroll position
    this._scrollDispatcherService.scrolled(0, () => {
      if (isNullOrEmpty(this.scrollableLinks)) { return; }
      let parentScrollTop = scrollableContainer.getElementRef().nativeElement.scrollTop;
      let parentScrollClientHeight = scrollableContainer.getElementRef().nativeElement.clientHeight;

      // Calculate the 50% of the parent scroll client height to move the link when it reach the 50% of scroll parent
      let screenPercentage = (parentScrollClientHeight || DEFAULT_SCROLL_TOP_OFFSET) * 0.50;
      parentScrollTop += screenPercentage;

      this.scrollableLinks.forEach((item) => {
        let linkTop = item.hostElement.offsetTop;
        let linkBottom = linkTop + item.hostElement.offsetHeight;
        if (parentScrollTop >= linkTop && parentScrollTop <= linkBottom) {
          this._activatedLinkByScrollChange.next(item);
        }
      });
    });
  }

  /**
   * Subscribes to activated link by scroll change and select
   * the corresponding element
   */
  private _subscribeToActivatedLinkByScrollChange(): void {
    this._activatedLinkByScrollChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged()
    ).subscribe((activatedLink) => {
      if (isNullOrEmpty(activatedLink)) { return; }
      this._selectLink(activatedLink);
      this._selectScrollHeader(activatedLink);
    });
  }

  /**
   * Selects the scrollable header
   */
  private _selectScrollHeader(header: ScrollableLinkComponent): void {
    if (isNullOrEmpty(header)) { return; }

    let headerIndex = this.scrollableLinks.toArray().indexOf(header);
    let responsiveItem = getSafeProperty(this._scrollableHeaders,
      (obj) => obj.toArray()[headerIndex].responsiveItem
    );
    if (!isNullOrEmpty(responsiveItem)) {
      responsiveItem.onClick();
    }
  }
}
