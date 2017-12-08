import {
  Directive,
  Input,
  Renderer2,
  ElementRef
} from '@angular/core';
import { coerceBoolean } from '../../utilities';

@Directive({
  selector: '[disabled]'
})

export class DisabledDirective {
  /**
   * Set the disabled type to the host element
   */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = coerceBoolean(value);
      this._setDisabled(this._disabled);
    }
  }
  private _disabled: boolean;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.disabled = false;
  }

  private _setDisabled(disabled?: boolean): void {
    if (disabled) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'disabled', 'true');
      this._renderer.addClass(this._elementRef.nativeElement, 'disabled-element');
    } else {
      this._renderer.removeAttribute(this._elementRef.nativeElement, 'disabled');
      this._renderer.removeClass(this._elementRef.nativeElement, 'disabled-element');
    }
  }
}
