import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ViewChild
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsScrollDispatcherService
} from '@app/core';
import {
  coerceNumber,
  coerceBoolean,
  isNullOrEmpty,
  refreshView,
  triggerEvent
} from '@app/utilities';
import { Paginator } from './paginator.interface';

// Constants default
const PAGINATOR_DEFAULT_PAGE_INDEX = CoreDefinition.DEFAULT_PAGE_INDEX;
const PAGINATOR_DEFAULT_PAGE_SIZE = CoreDefinition.DEFAULT_PAGE_SIZE;
const PAGINATOR_DEFAULT_LOAD_OFFSET = 10;

@Component({
  selector: 'mcs-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'paginator-wrapper'
  }
})

export class PaginatorComponent implements Paginator, OnInit, AfterViewInit {

  public loading: boolean;
  public textContent: any;
  public pageChangedStream: EventEmitter<any>;

  @Input()
  public get scrollLoadOffset(): number { return this._scrollLoadOffset; }
  public set scrollLoadOffset(value: number) {
    this._scrollLoadOffset = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _scrollLoadOffset: number;

  @Input()
  public get pageIndex(): number { return this._pageIndex; }
  public set pageIndex(value: number) {
    this._pageIndex = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex: number;

  @Input()
  public get pageSize(): number { return this._pageSize; }
  public set pageSize(value: number) {
    this._pageSize = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _pageSize: number;

  @Input()
  public get totalCount(): number { return this._totalCount; }
  public set totalCount(value: number) {
    this._totalCount = coerceNumber(value);
    this._changeDetectorRef.markForCheck();
  }
  private _totalCount: number;

  @Input()
  public get enableLoader(): boolean { return this._enableLoader; }
  public set enableLoader(value: boolean) {
    this._enableLoader = coerceBoolean(value);
    this._changeDetectorRef.markForCheck();
  }
  private _enableLoader: boolean;

  @ViewChild('nextButton')
  private _nextButton: ElementRef;

  public constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _scrollableDispatcher: McsScrollDispatcherService
  ) {
    this._pageIndex = PAGINATOR_DEFAULT_PAGE_INDEX;
    this._pageSize = PAGINATOR_DEFAULT_PAGE_SIZE;
    this._scrollLoadOffset = PAGINATOR_DEFAULT_LOAD_OFFSET;
    this._totalCount = 0;
    this.pageChangedStream = new EventEmitter<any>();
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.shared.paginator;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._listenToScrollChanged();
    });
  }

  /**
   * Return true if the paginator has next page otherwise false
   */
  public get hasNextPage(): boolean {
    let numberOfPages = Math.ceil(this.totalCount / this.pageSize) - 1;
    return this.pageIndex < numberOfPages && this.pageSize !== 0;
  }

  /**
   * Return true if the paginator has previous page otherwise false
   */
  public get hasPreviousPage(): boolean {
    return this.pageIndex >= 2 && this.pageSize !== 0;
  }

  /**
   * Returns true when loader/spinner should be displayed
   */
  public get showLoader(): boolean {
    return this.enableLoader && this.loading;
  }

  /**
   * Returns true if more button show be displayed
   */
  public get showMoreButton(): boolean {
    return this.loading === false
      && this.hasNextPage;
  }

  public get arrowDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public nextPage() {
    if (!this.hasNextPage) { return; }
    this.pageIndex++;
    this._onPageChanged();
  }

  public previousPage() {
    if (!this.hasPreviousPage) { return; }
    this.pageIndex--;
    this._onPageChanged();
  }

  public reset(): void {
    this.pageIndex = PAGINATOR_DEFAULT_PAGE_INDEX;
    this.pageSize = PAGINATOR_DEFAULT_PAGE_SIZE;
    this._onPageChanged();
  }

  public showLoading(showLoading: boolean) {
    this.loading = showLoading;
    this._changeDetectorRef.markForCheck();
  }

  private _onPageChanged() {
    this.loading = true;
    this._changeDetectorRef.markForCheck();
    this.pageChangedStream.next(this);
  }

  /**
   * Listen to each scroll changed
   */
  private _listenToScrollChanged(): void {
    let scrollContainer = this._scrollableDispatcher.getScrollContainers(this._elementRef);
    if (isNullOrEmpty(scrollContainer)) { return; }
    let scrollableParent = scrollContainer[0];
    let scrollableElement = scrollableParent.getElementRef().nativeElement as HTMLElement;

    scrollableParent.elementScrolled().subscribe(() => {
      this._scrollChanged(scrollableElement);
    });
  }

  /**
   * Event that emits when the scroll has changed
   * @param scrollableElement Scrollable element to listen to
   */
  private _scrollChanged(scrollableElement: HTMLElement): void {
    if (isNullOrEmpty(scrollableElement)) { return; }
    let scrollTop = scrollableElement.scrollTop;
    let scrollBottom = scrollTop + scrollableElement.offsetHeight;
    let scrollHeight = scrollableElement.scrollHeight;

    let loadNext = ((scrollHeight - scrollBottom) < this.scrollLoadOffset)
      && this.showMoreButton
      && !isNullOrEmpty(this._nextButton);

    if (loadNext) {
      triggerEvent(this._nextButton.nativeElement, 'click');
    }
  }
}
