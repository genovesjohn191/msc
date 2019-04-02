import {
  Directive,
  OnInit,
  Input,
  Renderer2,
  ElementRef
} from '@angular/core';
import { coerceBoolean } from '@app/utilities';
import { isNullOrUndefined } from 'util';

@Directive({
  selector: '[mcsGreyedOut]'
})

export class GreyedOutDirective implements OnInit {

  /**
   * Flag that determine when to grey out the text
   */
  @Input('mcsGreyedOut')
  public get mcsGreyedOut(): boolean { return this._mcsGreyedOut; }
  public set mcsGreyedOut(value: boolean) {
    if (value !== this._mcsGreyedOut) {
      this._mcsGreyedOut = coerceBoolean(value);
      if (this._mcsGreyedOut) {
        this._setOpacity();
      }
    }
  }

  private _mcsGreyedOut: boolean;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) { }

  public ngOnInit(): void {
    if (isNullOrUndefined(this._mcsGreyedOut)) { this._setOpacity(); }
  }

  /**
   * Sets the styled cursor
   */
  private _setOpacity(): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'opacity', 0.5);
  }
}
