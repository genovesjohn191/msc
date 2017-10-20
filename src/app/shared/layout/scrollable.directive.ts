import {
  Directive,
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

@Directive({
  selector: '[mcsScrollable]'
})

export class ScrollableDirective implements OnInit, OnDestroy, McsScrollable {
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
}
