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
  selector: '[mcsCursor]'
})

export class CursorDirective implements OnInit {
  /**
   * Set the cursor type to the host element
   */
  @Input('mcsCursor')
  public get cursor(): string { return this._cursor; }
  public set cursor(value: string) {
    if (this._cursor !== value) { this._cursor = value; }
  }
  private _cursor: string;

  /**
   * Flag that determine when the cursor would be displayed
   */
  @Input('mcsTriggerCursorIf')
  public get triggerCursorIf(): boolean { return this._triggerCursorIf; }
  public set triggerCursorIf(value: boolean) {
    if (value !== this._triggerCursorIf) {
      this._triggerCursorIf = coerceBoolean(value);
      this.triggerCursorIf ? this._setStyledCursor() : this._setDefaultCursor();
    }
  }
  private _triggerCursorIf: boolean;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.cursor = 'auto';
  }

  public ngOnInit(): void {
    if (isNullOrUndefined(this._triggerCursorIf)) { this._setStyledCursor(); }
  }

  /**
   * Sets the default cursor arrow head
   */
  private _setDefaultCursor(): void {
    this._renderer.removeStyle(this._elementRef.nativeElement, 'cursor');
  }

  /**
   * Sets the styled cursor
   */
  private _setStyledCursor(): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'cursor', this.cursor);
  }
}
