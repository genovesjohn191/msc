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
  unsubscribeSafely
} from '@app/utilities';
import { McsSelection } from '@app/models';
import { ScrollableLinkComponent } from './scrollable-link/scrollable-link.component';
import {
  ScrollableLinkHeaderComponent
} from './scrollable-link-header/scrollable-link-header.component';

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

export class ScrollableLinkGroupComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @Output()
  public change = new EventEmitter<any>();

  @ContentChildren(ScrollableLinkComponent)
  public scrollableLinks: QueryList<ScrollableLinkComponent>;

  @ViewChildren(ScrollableLinkHeaderComponent)
  private _scrollableHeaders: QueryList<ScrollableLinkHeaderComponent>;

  private _selectionModel: McsSelection<ScrollableLinkComponent>;
  private _activatedLinkByScrollChange = new Subject<ScrollableLinkComponent>();
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcherService: McsScrollDispatcherService
  ) {
    this._selectionModel = new McsSelection<ScrollableLinkComponent>(false);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._scrollableHeaders.changes
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this._initializeSelection());
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
   * Return the currently active link
   */
  public get activeLink(): ScrollableLinkComponent {
    return isNullOrEmpty(this._selectionModel.selected) ?
      undefined : this._selectionModel.selected[0];
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
    this._selectionModel.select(link);
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
   * Subscribe to scroll update location
   */
  private _subscribeToScrollUpdate(): void {
    let scrollableContainers = this._scrollDispatcherService.getScrollContainers(
      this.scrollableLinks.first.hostElement
    );
    if (isNullOrEmpty(scrollableContainers)) { return; }
    let scrollableLinkBody = scrollableContainers[scrollableContainers.length - 1];

    // Listen for every scroll position
    this._scrollDispatcherService.scrolled(0, () => {
      if (isNullOrEmpty(this.scrollableLinks)) { return; }
      let parentScrollTop = scrollableLinkBody.getElementRef().nativeElement.scrollTop;
      parentScrollTop += DEFAULT_SCROLL_TOP_OFFSET;

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
      Promise.resolve().then(() => {
        if (isNullOrEmpty(activatedLink)) { return; }
        this._selectLink(activatedLink);
      });
    });
  }
}
