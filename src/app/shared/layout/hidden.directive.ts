import {
  Directive,
  Input,
  Renderer2,
  ElementRef
} from '@angular/core';
import { coerceBoolean } from '../../utilities';

@Directive({
  selector: '[hidden]'
})

export class HiddenDirective {
  /**
   * Set the hidden to the host element
   */
  @Input()
  public get hidden(): boolean {
    return this._hidden;
  }
  public set hidden(value: boolean) {
    if (this._hidden !== value) {
      this._hidden = coerceBoolean(value);
      this._setHidden(this._hidden);
    }
  }
  private _hidden: boolean;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.hidden = false;
  }

  private _setHidden(hidden?: boolean): void {
    if (hidden) {
      this._renderer.addClass(this._elementRef.nativeElement, 'hide-element');
    } else {
      this._renderer.removeClass(this._elementRef.nativeElement, 'hide-element');
    }
  }
}
