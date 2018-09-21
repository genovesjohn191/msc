import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  registerEvent,
  unregisterEvent,
  isNullOrEmpty
} from '@app/utilities';

@Directive({
  selector: '[stop-propagation]'
})

export class StopPropagationDirective implements OnInit, OnDestroy {
  /**
   * Event handler references
   */
  private _onclickEventHandler = this._onClickElement.bind(this);

  constructor(private _elementRef: ElementRef) { }

  public ngOnInit(): void {
    registerEvent(this._elementRef.nativeElement, 'click', this._onclickEventHandler);
  }

  public ngOnDestroy(): void {
    unregisterEvent(this._elementRef.nativeElement, 'click', this._onclickEventHandler);
  }

  /**
   * Register the corresponding event to the element and stop the propagation
   *
   * `@Note:` Make sure you know how to use this or else
   * this will prevent the parent element from propagation of the click event
   * @param _event Click event instance
   */
  private _onClickElement(_event: Event): void {
    if (isNullOrEmpty(_event)) { return; }
    _event.stopPropagation();
  }
}
