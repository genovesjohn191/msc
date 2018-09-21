import {
  Directive,
  Input,
  NgZone,
  Renderer2,
  ElementRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import { McsScrollDispatcherService } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { Scrollable } from './scrollable.interface';

// Unique Id that generates during runtime
let nextUniqueId = 0;
type ScrollbarStyle = 'default' | 'dark';

@Directive({
  selector: '[scrollable]',
  host: {
    '[id]': 'scrollbarId'
  }
})

export class ScrollableDirective implements OnInit, OnDestroy, Scrollable {
  @Input()
  public scrollbarId: string = `mcs-scrollbar-item-${nextUniqueId++}`;

  @Input()
  public scrollbarSize: 'small' | 'medium';

  @Input('scrollable')
  public get scrollbarStyle(): ScrollbarStyle {
    return this._scrollbarStyle;
  }
  public set scrollbarStyle(value: ScrollbarStyle) {
    this._scrollbarStyle = value;
  }
  private _scrollbarStyle: ScrollbarStyle;

  private _elementScrolled: Subject<Event> = new Subject();
  private _scrollListener: any;

  constructor(
    private _elementRef: ElementRef,
    private _scrollDispatcher: McsScrollDispatcherService,
    private _ngZone: NgZone,
    private _renderer: Renderer2
  ) { }

  public ngOnInit(): void {
    this._scrollListener = this._ngZone.runOutsideAngular(() => {
      return this._renderer.listen(this.getElementRef().nativeElement, 'scroll', (event: Event) => {
        this._elementScrolled.next(event);
      });
    });
    this._scrollDispatcher.register(this);
    this._setElementOverflow();
    this._setScrollStyle();
    this._setScrollSize();
  }

  public ngOnDestroy(): void {
    this._scrollDispatcher.deregister(this);
    if (this._scrollListener) {
      this._scrollListener();
      this._scrollListener = null;
    }
  }

  /**
   * Returns observable that emits when a scroll event is fired on the host element.
   */
  public elementScrolled(): Observable<any> {
    return this._elementScrolled.asObservable();
  }

  /**
   * Return the element where the scollable directive is attached
   */
  public getElementRef(): ElementRef {
    return this._elementRef;
  }

  /**
   * Set the scroll style based on the UI design
   */
  private _setScrollStyle(): void {
    if (isNullOrEmpty(this.scrollbarStyle)) { this.scrollbarStyle = 'default'; }
    this._renderer.addClass(this._elementRef.nativeElement, `scrollbar-${this.scrollbarStyle}`);
  }

  /**
   * Set the overflow of the element to display the scroll
   */
  private _setElementOverflow(): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'overflow', 'auto');

    // Set the parent element overflow
    let parentElement = (this._elementRef.nativeElement as HTMLElement).parentElement;
    if (!isNullOrEmpty(parentElement)) {
      this._renderer.setStyle(parentElement, 'overflow', 'auto');
    }
  }

  /**
   * Set the scroll size
   */
  private _setScrollSize(): void {
    if (isNullOrEmpty(this.scrollbarSize)) { this.scrollbarSize = 'medium'; }
    this._renderer.addClass(this._elementRef.nativeElement, `scrollbar-${this.scrollbarSize}`);
  }
}
