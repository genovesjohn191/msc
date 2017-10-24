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
} from 'rxjs/Rx';
import {
  McsScrollDispatcherService,
  McsScrollable
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

type ScrollbarStyle = 'default' | 'dark';

@Directive({
  selector: '[scrollable]'
})

export class ScrollableDirective implements OnInit, OnDestroy, McsScrollable {

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
    this._setScrollStyle();
    this._setScrollSize();
  }

  public ngOnDestroy(): void {
    this._scrollDispatcher.deregister(this);
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
   * Set the scroll size
   */
  private _setScrollSize(): void {
    if (isNullOrEmpty(this.scrollbarSize)) { this.scrollbarSize = 'medium'; }
    this._renderer.addClass(this._elementRef.nativeElement, `scrollbar-${this.scrollbarSize}`);
  }
}
